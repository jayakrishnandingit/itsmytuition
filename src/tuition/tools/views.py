'''
Created on Feb 6, 2013

@author: jayakrishnan
'''
import datetime
from google.appengine.api import users
from django.shortcuts import render_to_response
from django import http

def addAnExpense(request):
    from tuition.settings import SITE_SUPPORT_EMAIL
    from forms import ExpenseForm
    from tuition.utils.manager import AppManager

    form = ExpenseForm(initial={'dateOfExpense' : datetime.date.today().strftime('%d/%m/%Y')})
    template_values = {
                       'form'               : form,
                       'loggedInEmployee'   : AppManager.getUserByEmail(AppManager.getCurrentLoggedInUser().email()),
                       'url'                : AppManager.createLogoutURL(),
                       'homePage'           : '/',
                       'supportEmail'       : SITE_SUPPORT_EMAIL
                       }
    return render_to_response('newExpense.html', template_values)

def viewUserExpenses(request, userKey=None):
    from tuition.settings import SITE_SUPPORT_EMAIL
    from tuition.utils.manager import AppManager
    from models import Expenses
    from forms import ExpenseForm, ExpenseYearFilter
    from tuition.utils.appConstants import MONTH_NUM_FULL_NAME_DICT
    from tuition.utils.utils import ExportHandle

    loggedInEmployee = AppManager.getUserByEmail(AppManager.getCurrentLoggedInUser().email())
    form = ExpenseForm(initial={'dateOfExpense' : datetime.date.today().strftime('%d/%m/%Y')})
    template_values = {
                       'loggedInEmployee'   : loggedInEmployee,
                       'url'                : AppManager.createLogoutURL(),
                       'homePage'           : '/',
                       'supportEmail'       : SITE_SUPPORT_EMAIL,
                       'yearFilterForm'     : ExpenseYearFilter(),
                       'monthNameDict'      : MONTH_NUM_FULL_NAME_DICT,
                       'exportHandle'       : ExportHandle.asDict(),
                       'form'               : form
                       }
    return render_to_response('viewExpenses.html', template_values)

def export(request):
  import datetime
  from tuition.settings import SITE_SUPPORT_EMAIL
  from tuition.utils.manager import AppManager
  from tuition.tools.models import Expenses
  from tuition.utils.utils import ExportSelector, EXPORT_HANDLE_LABELS, getMonthEnd

  serializedObjectList = []
  linkToFile = None
  fileName = None
  isSaved = False
  invalidHandle = True
  response = {}

  exportHandle = request.GET.get('handle', None)
  exportDate = datetime.datetime.strptime(request.GET.get('date', datetime.date.today().strftime('%d_%m_%Y')), '%d_%m_%Y')
  firstOfMonth = datetime.date(exportDate.year, exportDate.month, 1)
  endOfMonth = datetime.date(exportDate.year, exportDate.month, getMonthEnd(exportDate.month, exportDate.year))
  loggedInEmployee = AppManager.getUserByEmail(AppManager.getCurrentLoggedInUser().email())

  expensesList = Expenses.all().filter('user =', loggedInEmployee.key()).filter('dateOfExpense >=', firstOfMonth).filter('dateOfExpense <=', endOfMonth).order('-dateOfExpense').fetch(limit=1000)
  if expensesList:
    for expense in expensesList:
      serializedObjectList.append(expense.toDict)
    exporterClass = ExportSelector.get(exportHandle)
    if exporterClass:
      invalidHandle = False
      exporterInstance = exporterClass(
          serializedObjects=serializedObjectList, 
          request=request, 
          remove=['key', 'user'], 
          date=exportDate
      )
      response = exporterInstance.upload()
    if isinstance(response, dict):
      isSaved = response.get('isSaved')
      linkToFile = response.get('fileResponse', {}).get('alternateLink')
      fileName = response.get('fileResponse', {}).get('title')
      template_values = {
        'isSaved'            : isSaved, 
        'linkToFile'         : linkToFile,
        'fileName'           : fileName,
        'handle'             : EXPORT_HANDLE_LABELS.get(exportHandle, exportHandle),
        'invalidHandle'      : invalidHandle,  
        'loggedInEmployee'   : loggedInEmployee,
        'url'                : AppManager.createLogoutURL(),
        'homePage'           : '/',
        'supportEmail'       : SITE_SUPPORT_EMAIL
      }
      return render_to_response('exportFinish.html', template_values)
    else:
      return response

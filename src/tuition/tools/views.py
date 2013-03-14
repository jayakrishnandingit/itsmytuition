'''
Created on Feb 6, 2013

@author: jayakrishnan
'''
import datetime
from django.shortcuts import render_to_response

def addAnExpense(request):
    from tuition.settings import SITE_SUPPORT_EMAIL
    from forms import ExpenseForm
    from tuition.utils.manager import AppManager

    form = ExpenseForm(initial = {'dateOfExpense' : datetime.date.today().strftime('%d/%m/%Y')})
    template_values = {
                       'form'               : form,
                       'loggedInEmployee'   : AppManager.getCurrentLoggedInUser(),
                       'url'                : AppManager.createLogoutURL(request.path),
                       'homePage'           : '/',
                       'supportEmail'       : SITE_SUPPORT_EMAIL
                       }
    return render_to_response('newExpense.html', template_values)

def viewUserExpenses(request, userKey = None):
    from tuition.settings import SITE_SUPPORT_EMAIL
    from tuition.utils.manager import AppManager

    if AppManager.isCurrentUserAppAdmin():
        template_values = {
                           'loggedInEmployee'   : AppManager.getCurrentLoggedInUser(),
                           'url'                : AppManager.createLogoutURL(request.path),
                           'homePage'           : '/',
                           'supportEmail'       : SITE_SUPPORT_EMAIL
                           }
        return render_to_response('viewExpenses.html', template_values)

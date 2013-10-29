'''
Created on Feb 6, 2013

@author: jayakrishnan
'''
from django import forms as djangoSimpleForm
from tuition.common.forms import StrippedCharField

class ExpenseForm(djangoSimpleForm.Form):
    type = StrippedCharField(widget = djangoSimpleForm.TextInput(attrs = {'placeholder' : 'For example LIC'}), required = True)
    amount = djangoSimpleForm.FloatField(widget = djangoSimpleForm.TextInput(), required = True)
    dateOfExpense = djangoSimpleForm.DateField(input_formats = ["%d/%m/%Y"], widget = djangoSimpleForm.DateInput(attrs = {'placeholder' : 'DD/MM/YYYY'}), required = True)
    comments = StrippedCharField(widget = djangoSimpleForm.Textarea(), required = False)

class ExpenseYearFilter(djangoSimpleForm.Form):
	import datetime
	from tuition.common.forms import FormUtils

	choices = FormUtils().createYearTuple(start=2000)
	yearSelect = djangoSimpleForm.ChoiceField(choices=choices, initial=unicode(datetime.date.today().year), widget=djangoSimpleForm.Select())
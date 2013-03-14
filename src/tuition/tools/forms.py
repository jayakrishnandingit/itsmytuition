'''
Created on Feb 6, 2013

@author: jayakrishnan
'''
from django import forms as djangoSimpleForm
class ExpenseForm(djangoSimpleForm.Form):
    user = djangoSimpleForm.CharField(widget = djangoSimpleForm.TextInput(attrs = {'placeholder' : 'FirstName LastName'}), required = True)
    type = djangoSimpleForm.CharField(widget = djangoSimpleForm.TextInput(attrs = {'placeholder' : 'For example LIC'}), required = True)
    amount = djangoSimpleForm.FloatField(widget = djangoSimpleForm.TextInput(), required = True)
    dateOfExpense = djangoSimpleForm.DateField(input_formats = "%d/%m/%Y", widget = djangoSimpleForm.DateInput(attrs = {'placeholder' : 'DD/MM/YYYY'}), required = True)
    comments = djangoSimpleForm.CharField(widget = djangoSimpleForm.Textarea())

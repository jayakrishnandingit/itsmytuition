'''
Created on Feb 6, 2013

@author: jayakrishnan
'''
from google.appengine.ext import db
from tuition.common.models import CommonModel

class Expenses(CommonModel):
    user = db.ReferenceProperty(required = True)
    type = db.StringProperty(required = True)
    amount = db.FloatProperty(default = 0.0, required = True)
    dateOfExpense = db.DateProperty(required = True)
    comments = db.TextProperty()
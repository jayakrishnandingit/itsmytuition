'''
Created on Nov 12, 2012

@author: jayakrishnan
'''
from django.utils.datastructures import SortedDict
import os
from apiclient.discovery import build
from apiclient.http import MediaIoBaseUpload
from tuition.utils.appConfig import decorator

drive_service = build('drive', 'v2')
plus_service = build('plus', 'v1')

class ExportHandleEnum(SortedDict):
	def __init__(self, *args, **kwargs):
		super(ExportHandleEnum, self).__init__(*args, **kwargs)
		self.SPREADSHEET = 'SpreadSheet'

	def asDict(self):
		return self.__dict__

ExportHandle = ExportHandleEnum()

EXPORT_HANDLE_LABELS = {
	ExportHandle.SPREADSHEET : 'Google SpreadSheet'
}

class ExportSelector(object):
	@staticmethod
	def get(handle):
		selectors = {
			ExportHandle.SPREADSHEET : ExportToSpreadSheet
		}
		return selectors.get(handle)

class Exporter(object):
	serializedObjects = []
	mime_type = 'text/plain'
	fileToExport = None
	request = None

	def __init__(self, serializedObjects, request, **formatSpecifiers):
		import datetime

		self.serializedObjects = serializedObjects
		self.request = request
		self.formatSpecifiers = formatSpecifiers
		self.exportDate = formatSpecifiers.get('date', datetime.date.today())
		self.exportDate = datetime.datetime.combine(self.exportDate, datetime.datetime.now().time())

	def _clean(self, value):
		keysToRemove = set(self.formatSpecifiers.get('remove', []))
		for obj in value:
			if keysToRemove.issubset(set(obj.keys())):
				for item in list(keysToRemove):
					obj.pop(item)
		return value

class ExportToSpreadSheet(Exporter):

	def __init__(self, *args, **kwargs):
		super(ExportToSpreadSheet, self).__init__(*args, **kwargs)
		self.mime_type = 'text/csv'

	def createCSV(self):
		import csv
		import StringIO

		stdout = StringIO.StringIO()
		writer = csv.writer(stdout, dialect="excel")
		
		self.serializedObjects = self._clean(self.serializedObjects)
		for obj in self.serializedObjects:
			writer.writerow(obj.values())
		return stdout

	def create(self):
		import datetime

		valueToDrive = self.createCSV()
		media_body = MediaIoBaseUpload(valueToDrive, mimetype=self.mime_type, resumable=False)
		body = {
			'title' : 'Expenses_%s' % self.exportDate.strftime('%d_%b_%Y_%H_%M_%S'),
			'description' : '',
			'mimeType' : self.mime_type
		}
		self.fileToExport = drive_service.files().insert(body=body, media_body=media_body, convert=True)
		return self.fileToExport

	@decorator.oauth_required
	def upload(self):
		http = decorator.http()
		self.create()
		fileResponse = self.fileToExport.execute(http=http)
		return {
			'isSaved' : True,
			'fileResponse' : fileResponse
		}

class GooglePlusService(object):
	request = None
	loggedInEmployee = None
	user_response = {}

	def __init__(self, request, loggedInEmployee, **kwargs):
		self.request = request
		self.loggedInEmployee = loggedInEmployee

	@decorator.oauth_required
	def getUserInfo(self, setImageSize):
		http = decorator.http()
		self.user_response = plus_service.people().get(userId='me').execute(http=http)
		if setImageSize and self.user_response:
			imageUrl = self.user_response.get('image', {}).get('url', '')
			if imageUrl:
				urlSplit = imageUrl.split('?')
				imageUrl = '?'.join([urlSplit[0], 'sz=%d' % setImageSize])
				self.user_response['image']['url'] = imageUrl
		return {
			'isSaved' : True,
			'userInfo' : self.user_response
		}

def URLCreator(urlPattern, *keys):
    """A utility method to convert custom defined URLs(probably URLs in regex) to real time URLs for redirection.
    Pass a url pattern with or without key values that you want to substitute, it will return the desired URL for redirection.
    NOTE : The order of passing key values must be the same in which they appear in the URL. For example;
        custom URL = '^abcd/(key 1)/efgh/(key 2)' then,
        method invocation pattern : URLCreator('^abcd/(key 1)/efgh/(key 2)', value to substitute for key 1, value to substitute for key 2)

    @param urlPattern : a URL in regex pattern, example : r'^abcd/([a-zA-Z0-9-_]+)/view/([a-zA-Z]+)$'
    @param keys : values that you want to substitute for each key in the urlPattern (BEWARE of their order, refer docs above)
    @return:  A real time URL for redirection

    @author: jayakrishnan
    """
    if urlPattern:
        urlPattern = urlPattern.replace('^', '')
        urlPattern = urlPattern.replace('$', '')
        urlSplit = urlPattern.split('/')
        i = 0
        if keys or len(keys) > 0:
	        for uri in urlSplit:
	            if i < len(keys) and re.match(uri, keys[i]):
	                urlSplit[urlSplit.index(uri)] = keys[i]
	                i += 1
	        return '/' + '/'.join(urlSplit)
    return '/'

def weekStartEnd(day=None):
	import datetime

	day = day or datetime.date.today()
	day_of_week = day.weekday()
	to_beginning_of_week = datetime.timedelta(days=day_of_week)
	beginning_of_week = day - to_beginning_of_week
	to_end_of_week = datetime.timedelta(days=6 - day_of_week)
	end_of_week = day + to_end_of_week
	return {
		'start' : beginning_of_week, 
		'end' : end_of_week
	}

def getMonthEnd(month, year):
	import calendar

	return calendar.monthrange(year, month)[1]
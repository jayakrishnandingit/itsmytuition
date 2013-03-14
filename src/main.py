import appengine_config
from django.conf import settings
settings._target = None

from google.appengine.ext.webapp import util
from django.core.handlers import wsgi
import django.core.signals
import django.db
import django.dispatch
import logging

def log_exception(*args, **kwds):
    logging.exception('Exception in request:')

# Log errors.
django.dispatch.Signal.connect(
    django.core.signals.got_request_exception, log_exception)

# Unregister the rollback event handler.
django.dispatch.Signal.disconnect(
    django.core.signals.got_request_exception,
    django.db._rollback_on_exception)

def main():
    application = wsgi.WSGIHandler()
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()


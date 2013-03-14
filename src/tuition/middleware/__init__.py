class HandleRequests(object):
    def process_request(self, request):
        import logging
        from django import http
        from django.shortcuts import render_to_response
        from tuition.settings import SITE_DOWN_FOR_MAINTENANCE, SITE_DOWN_DESCRIPTION, SITE_SUPPORT_EMAIL
        from tuition.utils.manager import AppManager

        if AppManager.isCurrentUserAppAdmin():
            return None

        url = AppManager.isUserLoggedIn(request.path, request.path)
        if url:
            logging.info('Going to redirect user to %s.' % url)
            return http.HttpResponseRedirect(url)

        user = AppManager.getCurrentLoggedInUser()
        if user:
            if SITE_DOWN_FOR_MAINTENANCE:
                return render_to_response('siteDown.html', {'description' : SITE_DOWN_DESCRIPTION, 'supportEmail' : SITE_SUPPORT_EMAIL})
            # implement any OAuth in future.
            return None
        return None



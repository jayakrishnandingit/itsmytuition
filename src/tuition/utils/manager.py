from google.appengine.api import users

class AppManager(object):

    @staticmethod
    def checkWebLogin():
        return users.get_current_user()

    @staticmethod
    def checkOAuthLogin():
        import logging
        from google.appengine.api import oauth

        user = None
        try:
            user = oauth.get_current_user()
        except oauth.OAuthRequestError, e:
            logging.debug("OAuth Error: " + str(e))
            raise e
        return user

    @staticmethod
    def isCurrentUserAppAdmin():
        '''
        Check if the logged in user is an admin or not.
        We check for normal login and OAuth login
        @return boolean
        '''
        from google.appengine.api import oauth

        try:
            if users.is_current_user_admin():
                return True
    #   elif oauth.is_current_user_admin():
    #    return True
        except:
    # If there are no user or OAuth session then this will throw and OAuth error
    # We generally don't need to throw an exception here.
    # logging.exception("Exception in isCurrentUserAppAdmin: ")
            pass
        return False

    @staticmethod
    def getCurrentLoggedInUser():
        user = AppManager.checkWebLogin()
        #  enable checking the OAuth login once we implement OAuth 2.0
        #  if not user:
        #    user = AppManager.checkOAuthLogin()
        return user

    @staticmethod
    def isUserLoggedIn(requestedPath, redirectPath = '/'):

        redirectUrl = False
        if not AppManager.checkWebLogin():
            redirectUrl = AppManager.createLoginURL(redirectPath)
        return redirectUrl

    @staticmethod
    def createLoginURL(redirectPath = '/'):
        return users.create_login_url(redirectPath)

    @staticmethod
    def createLogoutURL(redirectPath):
        return users.create_logout_url(redirectPath)

    @staticmethod
    def getLoggedInEmployeePrivileges(requestPath, byPassCheck = False):
        import logging

        pathParts = requestPath.split('/')
        privileges = {}

#        privileges['is_admin'] = AppManager.isCurrentUserAppAdmin()
#        privileges['loggedInEmployee'] = AppManager.getLoggedInEmployee()
#
#        if privileges.get('is_admin', False):
#            privileges.update(AppManager._setLoggedInEmployeePrivileges(isAdmin = True))
#            return privileges
#
#        privileges.update(AppManager._setLoggedInEmployeePrivileges(isAdmin = False))
        return privileges

#    @staticmethod
#    def _setLoggedInEmployeePrivileges(isAdmin = False):
#        from tuition.role.api import RoleApi
#
#        RoleApi().get
#        return None
#
#    @staticmethod
#    def getLoggedInEmployee():
#        loggedInUser = AppManager.getCurrentLoggedInUser()

class UserFilter(AppManager):
    def checkUserRole(self, requestPath, byPassCheck = False):
        return AppManager.getLoggedInEmployeePrivileges(requestPath, byPassCheck)

from django.conf.urls.defaults import patterns, include, handler500, handler404
from tuition.urlPatterns import UrlPattern

handler404 = 'tuition.home.views.custom404'
handler500 = 'tuition.home.views.custom500'
urlpatterns = patterns(
                       '',
                       (r'^accounts/', include('allauth.urls')),
                       (UrlPattern.HOME, 'tuition.home.views.home'),
                       (UrlPattern.VIEW_ROLES, 'tuition.role.views.viewRoles'),
                       (UrlPattern.ADD_ROLE, 'tuition.role.views.addRole'),
                       (UrlPattern.VIEW_EXPENSES, 'tuition.tools.views.viewUserExpenses'),
                       (UrlPattern.ADD_EXPENSE, 'tuition.tools.views.addAnExpense'),
                       )

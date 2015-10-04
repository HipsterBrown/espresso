Flux = require('mcflux')
_ = require('underscore')
# instance vars
attrs = {}
onboardingTemplates = {}
accessRoles = {}
isReady = false
isLoadingTemplate = false
isCompleting = false
isSaving = false
saved = false
isDeleting = false
deleted = false
isUpdating = false
updated = false

module.exports = AdminOnboardingSessionStore = Flux.createStore(
  {
    getState: ->
      attrs: attrs
      accessRoles: accessRoles
      onboardingTemplates: onboardingTemplates
      isReady: isReady
      isLoadingTemplate: isLoadingTemplate
      isCompleting: isCompleting
      isSaving: isSaving
      saved: saved
      isDeleting: isDeleting
      deleted: deleted
      isUpdating: isUpdating
      updated: updated
  },

  (payload) ->
    switch payload.actionType
      when 'BUILD_ONBOARDING_SESSION', 'BUILD_ADMIN_ONBOARDING_SESSION'
        attrs = payload.attrs
        onboardingTemplates = payload.onboardingTemplates
        accessRoles = payload.accessRoles
        isReady = true

      when 'FETCHING_ADMIN_ONBOARDING_SESSION'
        isReady = false
        attrs.meta ?= {}
        attrs.meta.errors = payload.errors

      when 'ERROR_FETCHING_ADMIN_ONBOARDING_SESSION'
        isReady = true

      when 'SAVING_ADMIN_ONBOARDING_SESSION'
        isSaving = true
        saved = false
        attrs.meta ?= {}
        attrs.meta.errors = {}

      when 'SAVED_ADMIN_ONBOARDING_SESSION'
        attrs = payload.attrs
        attrs.meta ?= {}
        attrs.meta.is_complete = true
        isSaving = false
        saved = true

      when 'ERROR_SAVING_ADMIN_ONBOARDING_SESSION'
        isSaving = false
        saved = false
        attrs.meta ?= {}
        attrs.meta.errors = payload.errors

      when 'FETCHING_ONBOARDING_TEMPLATE'
        isLoadingTemplate = true
        attrs.meta ?= {}
        attrs.meta.errors ?= {}
        attrs.onboarding_template_id = payload.onboardingTemplateId
        delete attrs.meta.errors.onboarding_template_id

      when 'FETCHED_ONBOARDING_TEMPLATE'
        isLoadingTemplate = false
        attrs ?= {}
        attrs.onboarding_template_id = payload.onboardingTemplateId
        attrs.onboarding_admin_fields = payload.onboardingAdminFields
        attrs.onboarding_esig_docs = payload.onboardingESigDocs

      when 'ERROR_FETCHING_ONBOARDING_TEMPLATE'
        isLoadingTemplate = false

      when 'UPDATING_ADMIN_ONBOARDING_SESSION'
        isUpdating = true
        updated = false

      when 'UPDATED_ADMIN_ONBOARDING_SESSION'
        attrs = payload.attrs
        attrs.meta ?= {}
        attrs.meta.is_complete = true
        isUpdating = false
        updated = true

      else
        true

    AdminOnboardingSessionStore.emitChange()
    true
)

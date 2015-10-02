React = require('react')
D = require('dom')
$ = require('jquery')
_ = require('underscore')
EventModel = require('models/event')
EventsActions = require('actions/events')
Loading = require('ui/common/loading')
FormErrors = require('ui/forms/form_errors')
Checkbox = require('ui/forms/checkbox')
FileField = require('ui/forms/file_field')
FileFieldImagePreview = require('ui/forms/file_field_image_preview')
UserIcon = require('ui/common/user_icon')
Utils = require('utils')

Loading = React.createFactory Loading
FormErrors = React.createFactory FormErrors
Checkbox = React.createFactory Checkbox
FileField = React.createFactory FileField
FileFieldImagePreview = React.createFactory FileFieldImagePreview
UserIcon = React.createFactory UserIcon

module.exports = React.createClass
  displayName: 'UpdateForm'

  propTypes:
    emailAllAbility: React.PropTypes.bool

  handleSubmit: (e) ->
    e.preventDefault()
    return false if @props.creating

    content =  @refs.content.getDOMNode().value.trim() || " "
    file = @refs.image.getFiles()[0]


    if @props.emailAllAbility
      if @refs.emailAll.refs.input.getDOMNode()
        emailAll = @refs.emailAll.refs.input.getDOMNode().checked is true

    EventsActions.share(content, emailAll, file)

    @image = null
    @imageName = null
    @resetAttachment()
    @refs.content.getDOMNode().value = ''
    @setState(focused: false, previewing: false)
    @refs.content.getDOMNode().style.height = '32px'

  handleFocus: (e) ->
    @setState focused: true

  handleIconLoaded: (url) ->
    @setState iconUrl: url

  handleKeyUp: (e) ->
    if @refs.content.getDOMNode().value.trim() != ''
      @setState validTextContent: true
    else
      @setState validTextContent: false

  handleKeyDown: (e) ->
    if e.metaKey && e.keyCode == 13 && @isSubmittable()
      e.target.blur()
      @handleSubmit e

    if @refs.content.getDOMNode().value.trim().length > 0
      @setState validTextContent: true
    else
      @setState validTextContent: false

  handleInput: (e) ->
    if e.target.scrollHeight > 400
      return if @state.maxedHeight
      e.target.style.height = 400 + "px"
      @setState maxedHeight: true
    else
      e.target.style.height = "auto"
      e.target.style.height = e.target.scrollHeight + "px"

  handlePaste: (e) ->
    @setState maxedHeight: false
  
  handleBlur: ->
    if @refs.content.getDOMNode().value.trim().length == 0 && !@state.previewing
      @refs.emailAll.refs.input.getDOMNode().checked = false if @props.emailAllAbility && @refs.emailAll.refs.input.getDOMNode()
      @refs.content.getDOMNode().style.height = '32px'
      @setState {
        focused: false
        maxedHeight: false
      }

  resetAttachment: ->
    @setState resetAttachment: true
    setTimeout(
      () =>
        @setState resetAttachment: false
      , 200
    )

  getInitialState: ->
    focused: false
    previewing: false
    resetAttachment: false
    validTextContent: false
    emailAllAbility: false
    iconUrl: null

  componentDidMount: ->
    self = @
    Utils.getProfileIcon(75, @handleIconLoaded, @)
    $(document).on('click', (e) ->
      if !$(e.target).closest(self.getDOMNode()).length
        self.handleBlur()
    )
    $(window).on('dragover', @dragFocus)
    $(window).on('dragleave', @dragBlur)

  componentWillUnmount: ->
    $(window).off('dragover', @dragFocus)
    $(window).off('dragleave', @dragBlur)

  dragFocus: (e) ->
    @setState(
      focused: true
    )

  dragBlur: (e) ->
    if e.target.id == "layout"
      @handleBlur()

  handleFileRemoval: ->
    @setState previewing: false
    @resetAttachment()

  handleFileChange: (e) ->
    @setState focused: true
    reader = new FileReader()
    @imageName = e.name
    reader.onload = (e) =>
      @image = reader.result
      @setState previewing: true
    reader.readAsDataURL(e.image)

  isSubmittable: ->
    return @state.previewing || @state.validTextContent

  render: ->
    classes = ['update-form']
    classes.push('no-trans') if @state.noTrans
    classes.push('maxed-h') if @state.maxedHeight
    classes.push('on') if @state.focused

    D.div {
      className: classes.join(' ')
      "data-animate": "fade-in"
    }, [
      if @state.iconUrl
        UserIcon icon: @state.iconUrl, size: 40
      D.form { onSubmit: @handleSubmit, encType: 'multipart/form-data' }, [
        D.textarea {
          className: 'input-content'
          placeholder: 'Share an update...'
          ref: 'content'
          defaultValue: ''
          onFocus: @handleFocus
          onKeyDown: @handleKeyDown
          onChange: @handleInput
          onPaste: @handlePaste
        }
        Loading() if @props.creating
        if @state.previewing == true
          FileFieldImagePreview(
            image: @image
            name: @imageName
            onFileRemoval: @handleFileRemoval
          )
        D.div { className: 'update-hidden clearfix' }, [
          if !_.isEmpty(@state.errors)
            FormErrors(errors: @state.errors)
          D.div {className: 'update-col left'}, [
            if !@state.resetAttachment
              FileField(
                inputClass: 'naked btn with-icon for-attaching'
                label: 'Attach'
                name: 'image'
                ref: 'image'
                onFileChange: @handleFileChange
                showPreview: true
                previewState: @state.previewing
                inputAttrs:
                  accept: 'image/png, image/jpeg, image/gif, application/pdf, application/msword'
              )
          ]
          D.div {className: 'update-col right'}, [

            if @props.emailAllAbility == true
              Checkbox(
                inputClass: '-n-checkbox'
                label: 'Email update to all'
                name: 'email_all'
                ref: 'emailAll'
                disabled: !@isSubmittable()
              )
            D.button {className: 'button stout-button', type: 'submit', disabled: !@isSubmittable()}, 'Share'
          ]
        ]
      ]
    ]

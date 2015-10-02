React = require('react')
DateTime = React.createFactory require('ui/common/datetime')

module.exports = EventDate = React.createClass
  displayName: "EventDate"

  getDefaultProps: ->
    standalone: false
    dateOnly: false

  render: ->
    date = DateTime(
      unixTimestamp: @props.date,
      utcOffset: @props.utcOffset,
      dateOnly: @props.dateOnly,
      extraClass: 'event-date'
    )
    if @props.standalone
      date
    else
      React.DOM.a {
        href: @props.href,
        className: 'event-date-link'
      }, date

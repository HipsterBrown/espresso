React.createClass(
  propTypes:
    items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired

  render: ->
    test = Number(@props.items[0])
)

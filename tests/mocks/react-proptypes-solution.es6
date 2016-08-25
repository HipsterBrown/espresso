React.createClass({
  propTypes: {
    items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  },
  render: function() {
    var test;
    return test = Number(this.props.items[0]);
  }
});

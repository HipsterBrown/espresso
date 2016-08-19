unless (items = someObject.property).length == 0
  console.log items

newObject =
  methodOne: ->
    attrs = {}

    if attrs.length
      test = 'value'
    else
      test = 'another value'

    attrs

  methodTwo: (data) ->
    attrs = data

    if attrs.length
      test = 'value'
    else
      test = 'another value'

    attrs

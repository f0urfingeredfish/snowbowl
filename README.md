# snowbowl

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module rotates through the snow reports for [Discovery](https://www.skidiscovery.com/), [Snowbowl](https://www.montanasnowbowl.com/), and [Lost Trail](https://www.losttrail.com/) ski areas.


## Screenshot
![image](https://user-images.githubusercontent.com/399068/55690234-c55aeb00-594b-11e9-96b5-7d8c85d6e365.png)


## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'snowbowl',
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `option1`        | *Required* DESCRIPTION HERE
| `option2`        | *Optional* DESCRIPTION HERE TOO <br><br>**Type:** `int`(milliseconds) <br>Default 60000 milliseconds (1 minute)

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
                updateInterval: 10 * 1000,
                fetchReportInterval: 1000 * 60 * 60,
                retryDelay: 5000
            }
        }
    ]
}
```

## Configuration options

| Option                 | Description
|----------------------- |-----------
| `updateInterval`       | *Optional* Interval for rotating through snow reports. Default: 10 seconds
| `fetchReportInterval`  | *Optional* How often to fetch new snow reports. Default: 60 minutes
| `retryDelay`           | *Optional* How often to retry a failed report fetch. Default: 5 seconds

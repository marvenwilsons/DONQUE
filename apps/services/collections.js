const path = require('path')
const Templates = require(path.join(__dirname,'../../server/templates.js'))

module.exports = Templates.Service({
    name: 'Collections',
    data: function(sql,fetch) {
        // perform get request here
        return [
            {
                collectionName: 'test 1'
            }
        ]
    },
    views: function(data,task,paneSettings,paneModal,utils) {
        if(Array.isArray(data)) {
            return {
                component: 'listify',
                componentConfig: {
                    dataControllers: [
                        {
                            name: 'open page',
                            handler: function(helper) {
                                console.log('hello world')
                                console.log(helper)
                            }
                        },
                        {
                            name: 'remove page',
                            handler: function(helper) {
                
                            }
                        },
                    ]
                },
                paneOnLoad: function() {
                    console.log('testing! on load', data)
                }
            }
        }
    },
    config: {
        dataSchema: {}, // define the exact sturcture of data property
        paneName: 'Collections',
        paneWidth: '600px',
        isClosable: true
    },

})
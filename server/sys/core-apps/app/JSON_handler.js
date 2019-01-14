const fs = require('fs')
const dbLoc = require('../../admin assets/app/config')
const path = require('path')
const p = path.join(__dirname, '../../admin assets/app')
class _json {



    action(dbName, _method, query, data, callback) {
        const method = _method.split('/')[0]
        const methodOpt = _method.split('/')[1]

        switch (method) {
            case 'read':
                const requestDb = `${dbName}.json`

                if (fs.readdirSync(p).indexOf(requestDb) != -1) {
                    const content = fs.readFileSync(`${p}/${requestDb}`, 'utf-8')
                    return callback(null, JSON.parse(content))
                } else {
                    callback(`[JSON handler] there is no such database : ${dbName}`)
                }
                break
            case 'create':
                if (methodOpt == 'entity') {
                    if(typeof data == 'object'){
                        if (fs.readdirSync(p).indexOf(`${dbName}.json`) != -1){
                            const _data = JSON.parse(fs.readFileSync(`${p}/${dbName}.json`, 'utf-8'))
                            const keyCurDb = new Set (Object.keys(_data))
                            const keyToBeAdded = Object.keys(data)
                            const keysAlreadyExist = []
                            let nData = _data
                            keyToBeAdded.map(e => {
                                if (keyCurDb.has(e)){
                                    keysAlreadyExist.push(e)
                                }else{
                                    nData[e] = data[e]
                                }
                            })

                            if(keysAlreadyExist.length != 0){
                                callback(`[JSON handler] ${keysAlreadyExist} key already exist in ${dbName} database`)
                            }else{
                                fs.writeFile(`${p}/${dbName}.json`, JSON.stringify(nData, null, '\t'), (err, res) => {
                                    if (err) {
                                        callback(true, null)
                                    } else {
                                        callback(false, {
                                            status: true,
                                            message: `successfully added props to ${dbName} database`
                                        })
                                    }
                                })
                            }
                        }else{
                            callback(`[JSON handler] there is no such database : ${dbName}`)
                        }
                    }else{
                        callback('[JSON handler]  data should be an object')
                    }

                }
                else if (methodOpt == 'database') {
                    if (fs.readdirSync(p).indexOf(`${dbName}.json`) != -1) {
                        callback(`${dbName} database already exist`)
                    } else {
                        fs.writeFile(`${p}/${dbName}.json`, JSON.stringify(data, null, '\t'), (err, res) => {
                            if (err) {
                                callback(true, null)
                            } else {
                                callback(false, {
                                    status: true,
                                    message: `successfully created ${dbName} database`
                                })
                            }
                        })
                    }
                }
                break

        }
    }
}

module.exports = _json
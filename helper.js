import templates from './templates'
import procedures from './procedures'
import controlpanel from '@/apps/controlpanel/controlpanel'
import utils from './utils'

export default {
    data: () => ({
        h: undefined,
        componentConfig: null,
        controls: undefined,
        actions: undefined
    }),
    mounted() {
        this.$p = this.h
        this.controls = controlpanel(this)
        this.actions = this.controls.actions
    },
    methods: {
        /** sys utils */
        systemError(msg) {
            this.actions.sysmodal.logerr(`FATAL: ${msg}`, () => {
                location.reload()
            })
        },
        m() {
            return this
        },
        cp: utils.copy,
        pipe: utils.pipe,
        validateString:utils.validateString,
        answerPending(answer,pointer) {
            // console.log('> Answering pending question')
            if(answer && answer != '--void--') {
                this.h.$store.commit('stateController', {
                    key: 'queueCurrentTaskAnswer',
                    value: answer
                })

            }

            this.h.$store.commit('updateQueueAnswers', {
                index: this.h.$store.state.queuePointer,
                answer: '--done--',
                pointer
            })
        },
        runCompiledTask(taskArray) {
            /********************************************************************
             * push procedures to queue together with its function dependecies
             * the first item in taskArray is the item that needs to be completed
             * the sencond item to the last are the functions that executes for the
             * purpose of completing the first item in the taskArray.
             * ****************************************************************** 
             */
            let x = []
            let queueAnswersArray = []
            taskArray.map((e,i) => {
                queueAnswersArray.push({
                    answer: '--not answered--'
                })
                if(e) {
                    /*** type 1 is an object that tells what function to execute */
                    // const taskBeingCalled = e.taskName == 'exec' ? true : this[`private.${e.taskName}`]
                    const taskBeingCalled = e.taskName == 'exec' ? true : procedures(this,e.taskName)
                    if(taskBeingCalled == undefined) {
                        new templates.DonqueDevError(`ERR: "${e.taskName}" function or task does not exist`)
                    } else {
                        if(e.taskParam == undefined || e.taskParam == null) {
                            new templates.DonqueDevError(`ERR: "taskParam" property cannot be undefined of null at index: ${i} task name: ${e.taskName}`)
                        } else {
                            if(e.taskName == 'exec') {
                                x.push(new templates.ExecQueueItem({
                                    fn: taskBeingCalled,
                                    param: e.taskParam,
                                    m: this.m
                                }))
                            } else {
                                x.push(new templates.NormalQueueItem({
                                    fn: taskBeingCalled,
                                    param: e.taskParam
                                }))
                            }                     
                        }
                    }
                }
            })
            this.h.$store.commit('stateController', {
                key: 'queue',
                value: x
            })
            const staticCopy = this.cp(x)
            this.h.$store.commit('stateController', {
                key: 'queueStatic',
                value: Object.freeze(staticCopy)
            })
            this.h.$store.commit('stateController', {
                key: 'queueAnswersArray',
                value: queueAnswersArray
            })
        },
        covertToPaneView(n){
            n = n.toLowerCase()
            n = `p-${n}`
            return n
        },
        paneSettings({paneName,paneWidth,isClosable}) {
            if(paneName) {
                this.$store.commit('paneController',{
                    index: this.paneIndex,
                    key: 'paneName',
                    value: paneName
                })
            } 
            
            if(paneWidth) {
                this.$store.commit('paneController',{
                    index: this.paneIndex,
                    key: 'paneWidth',
                    value: paneWidth
                })
            }
            
            if(isClosable) {
                this.$store.commit('paneController',{
                    index: this.paneIndex,
                    key: 'isClosable',
                    value: isClosable
                })
            }
        },
        normyDep(paneIndex,scope) {
            return ((s) => {
                const syspanemodal = {
                    close: () =>  s.actions.syspane.modal.update(paneIndex,'closeModal'),
                    appendErrorMsg: msg => s.actions.syspane.modal.appendErrorMsg(paneIndex,msg),
                    appendInfoMsg:  msg => s.actions.syspane.modal.appendInfoMsg(paneIndex,msg),
                    logError:  (msg,fn) => s.actions.syspane.modal.logError(paneIndex,msg,fn),
                    logInfo:   (msg,fn) => s.actions.syspane.modal.logInfo(paneIndex,msg,fn),
                    logWarn:   (msg,fn) => s.actions.syspane.modal.logWarn(paneIndex,msg,fn),
                }
                const syspane = {
                    close:      () => s.actions.syspane.close(paneIndex),
                    closeUnUsedPane: () => s.actions.syspane.delete(paneIndex + 1),
                    render:   (data,viewIndex) => s.render(data,paneIndex,viewIndex),
                    spawnModal:    modalObject => s.spawnModal(paneIndex,modalObject),
                    prompt:  (promptObject,cb) => s.actions.syspane.prompt(paneIndex,promptObject,cb),
                    updatePaneData:(  objData) => s.updatePaneData(paneIndex,objData),
                    updatePaneConfig: (config) => s.updatePaneConfig(paneIndex,config) ,
                    getCurrentPaneIndex:    () => paneIndex
                }
                const dWinMethods = {
                    spawn: dWinObject => s.actions.dwin.spawn(dWinObject),
                    close: (section) => s.actions.dwin.close(section)
                }
                return { syspane, syspanemodal, dWinMethods }
            })(scope)
        },
        /** end of dwin */
        renderPane(data, paneIndex,viewIndex) {
            // console.log('renderPane', data)
            if(paneIndex == undefined || paneIndex == null) {
                this.systemError('renderPane error, paneIndex cannot be undefined')
                return
            }
            const { actions } = this.controls


            // console.log('helper',paneIndex, this.$store.state.pane.length - 1)
            if(this.$store.state.pane[paneIndex + 1] == undefined) {
                // console.log('> renderPane Case1')
                /** it means add one pane */
                actions.syspane.addsync(data)
            } else {
                // console.log('> renderPane Case2')
                /** it means update the paneData? or replace the pane with a new view  */
                if(paneIndex + 1 == this.$store.state.pane.length - 1) {
                    actions.syspane.updatePane(paneIndex + 1, this.getServiceView(data.paneConfig.paneData,viewIndex))
                    .then(res => {
                        const {syspane,syspanemodal} =  this.normyDep(paneIndex + 1,this)
                        this.$store.state.pane[paneIndex + 1].paneConfig.paneOnLoad(syspane,syspanemodal)
                    })
                } else {
                    // console.log('> renderPane Case3')
                    actions
                    .syspane
                    .add(data)
                    .then(res => {
                        const {syspane,syspanemodal} =  this.normyDep(paneIndex + 1,this)
                        this.$store.state.pane[paneIndex + 1].paneConfig.paneOnLoad(syspane,syspanemodal)
                    })
                }
                
            }
            
        },
        getServiceView(dataSet,viewIndex){
            // console.log('> Getting service view ', dataSet)
            // returns a service objects
            const {views} = this.$store.state.app['app-services'][this.$store.state.app['active-sidebar-item']]
            const deserializeViews = new Function('return ' + views)()
            const helper = {  /** this for global access, if you use this, you have to provide a paneIndex, or if not all panes will be affected */
                paneSettings: this.paneSettings,
                paneModal : this.paneModal,
                renderPane : this.renderPane,
                getServiceView: this.getServiceView,
                closePane: this.closePane,
                render: this.render,
                systemError: this.systemError,
                closeUnUsedPane: this.closeUnUsedPane,
                panePrompt: this.panePrompt,
                updatePaneData: this.updatePaneData,
                updatePaneConfig: this.updatePaneConfig,
                getCurrentPaneIndex: this.paneIndex
            }
            
            // dependency enject the views function
            const serviceObject = deserializeViews(dataSet,helper,utils,templates)

            if(!serviceObject) {
                this.systemError('getServiceView error: Unhandled dataSet in service views, cannot find a service view, check console log for more details')
            } else {
                // Problem start here, the data will be incorrect starting on a non zero index pane
                const { componentConfig, paneConfig, paneOnLoad, onModalData } = serviceObject
                if(!paneConfig.modal) {
                    paneConfig.modal = {}
                    paneConfig.modal.modalBody = undefined
                    paneConfig.modal.componentConfig = undefined
                    paneConfig.modal.modalConfig = undefined
                    paneConfig.modal.modalErr = undefined
                    paneConfig.modal.modalInfo = undefined
                    paneConfig.modal.isClosable = false
                    paneConfig.modal.modalWidth = undefined
                }
                paneConfig.modal.onModalData = onModalData
                paneConfig.paneOnLoad = paneOnLoad

                if(typeof viewIndex == 'number') {
                    if(paneConfig.paneViews[viewIndex] == undefined) {
                        this.systemError(`System Error: Invalid index value in render method, value: ${viewIndex} \n Cannot set pane view of undefined, reverting to 0 index pane view`)
                    } else {
                        paneConfig.defaultPaneView = viewIndex
                    }
                }
                return { componentConfig, paneConfig }
            }
            
        },
        render(dataSet,paneIndex,viewIndex) {
            this.renderPane(this.getServiceView(dataSet,viewIndex),paneIndex,viewIndex)
        },
        /** close pane */
        closePane() {      
            this.actions.syspane.close(this.paneIndex)
        },
        /** closes a the pane modal */
        closePaneModal(paneIndex) {
            return this.actions.syspane.modal.update(paneIndex,'closeModal')
        },
        closeGlobalModal(cb) {
            this.actions.sysmodal.closeModal()
            if(cb) {
                cb()
            }
        },
        /** spwans a modal to a pane */
        spawnModal(paneIndex,modalObject) {
            // call templates here
            try {
                this.closePaneModal(paneIndex).then(() => {
                    this.$store.commit('paneModalOverwrite', {
                        paneIndex,
                        modalObject: new templates.paneModal(modalObject)
                    })
                })
            }catch(err) {
                this.systemError(`activaPaneModal ERR \n ${err}`)
            }
        },
        /** Updates the pane data */
        updatePaneData(paneIndex,paneData) {
            this.commit('paneUpdateData', {
                paneIndex,
                paneData
            })
        },
        updatePaneConfig(paneIndex,config) {
            this.$store.commit('paneUpdateConfig', {
                index: paneIndex,
                key: config.key,
                value: config.value
            })
        }
    }
}
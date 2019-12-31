import { TweenMax, TimelineLite, TweenLite } from "gsap";

export const state = () => ({
    // config
    visibility: false,
    closable: false,
    head_visibility: true,
    ui_type: undefined, // err, msg, success, custom
    width: '350px',
    height: '100px',

    // content
    body: undefined,
    head: undefined,
    exec_after_msg: [],

    // temp
    temp_Cmd: undefined
})

/**
 * @api_modal
 * @param {*} body
 * @param {*} head
 * @param {string} config.ui_type
 * @param {boolean} config.closable
 * 
 * @example 
 *  this.$store.commit("modal/set_modal", { 
 *      head: "", // text you want to appear to modal head 
 *      body: 'your msg here', 
 *      config: {  
 *          ui_type: "msg", // msg, prompt_err, custom
 *          closable: false } 
 *      });
 * 
 * @copy_to_components
    this.$store.commit("modal/set_modal", {
        head: "", 
        body: "your msg here",
        config: {
          ui_type: "msg",
          closable: false
        }
      });
 */

/**
 * @api_modal pane
 *    
 * this.$emit("SetPaneModal", {
      pane_index: this.my_pane_index,
      pane_name: 'Dashboard',
      component: ModalComponent, <-- .vue file import
      title: "Create Collection",
      width: "420px",
      CanBeClose: true,
      header: true
    });
 */

export const mutations = {
    // set temp cmd
    set_tempCmd(state,value) {
        state.temp_Cmd = value
    },
    reset_tempCmd(state,value) {
        state.temp_Cmd = undefined
    },
    // when call it will show a spinner into a screen
    set_visibility(state,value) {
        this.commit('modal/set_modal', {
            head: null,
            body: null,
            config: {
              visibility: value
            }
        })
    },
    reset_modal() {
        state.body = undefined
        state.head = undefined
    },     
    set_modal(state,{body,head,config}){
        const {visibility,closable,head_visibility, ui_type, height, width} = config 

        // setting config
        // typeof visibility === 'boolean' ? state.visibility = visibility : state.visibility = true
        typeof closable === 'boolean' ? state.closable = closable : state.closable = true
        typeof head_visibility === 'boolean' ? state.head_visibility = head_visibility : state.head_visibility = true
        height && (state.height = height)
        width && (state.width = width)

        // required each call to have ui_type passed in config object
        state.ui_type = ui_type

        // content
        state.body = body
        state.head = head

        if(visibility == false) {
            // animate first before setting to visibility false
            state.visibility = false 
        } else {
            state.visibility = true           
            
            setTimeout(() => {
                const el = document.getElementById('dq-modal-host')
                if(el) {
                    TweenMax.fromTo(
                    el,
                    0.3,
                    { opacity: 0, marginTop: "40px", ease: Power2.easeInOut },
                    { opacity: 1, marginTop: "0px", ease: Power2.easeInOut }
                  );
                }
                
            }, 0);
        }
    },

    exec_after_hook(state) {
        if(state.exec_after_msg.length != 0){
            state.exec_after_msg.map(e => {
                e()
            })
        }        
    },

    exec_after_msg(state,fn) {
        state.exec_after_msg.push(fn)
    }
}

export const actions = {
    // after modal close
    // after modal ok press
}
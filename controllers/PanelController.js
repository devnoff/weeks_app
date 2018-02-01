import React, { Component } from 'react';

var _children = []
var _parentView = null
var _currentPanel = null
var _animating = false

export default class PanelController {

  refs = {}

  constructor(parentView, root) {
    _parentView = parentView
    _children.push(root)

    this.getRootPanel = () => {
      return _children[0]
    }

    this.getCount = () => {
      return _children.length
    }

    this.isAnimating = () => {
      return _animating
    }
  }

  initialize() {
    let last = this._lastChild()
    let el = this.refs[last.ref]
    el.show()
  }

  popToRootPanel(callback) {
    if (_children.length > 1) {
      _animating = true

      let last = this._lastChild()

      // 2.
      this.refs[last.ref].onHide = () => {
        // Remove Ref
        this.refs = {}

        // Empty children
        _children = [_children[0]]
  
        // Animate show child view through force update parent
        let tmpl = this.getRenderableElement()
        tmpl.visible = false
        _parentView.forceUpdate(() => {
          let last = this._lastChild()
          let el = this.refs[last.ref]
          el.onShow = () => {
            _animating = false
          }
          el.show()

          if (callback) callback()
        })
      }

      // 1.
      this.refs[last.ref].hide()
    }
  }

  /*
   * Push a Child Panel
   */
  push(childInfo, callback, inject) {

    _animating = true

    let show = () => {
      // Add new child in stack
      _children.push(childInfo)

      // Get last
      let last = this._lastChild()

      // Animate show child view through force update parent
      _parentView.forceUpdate(() => {
        let el = this.refs[last.ref]
        console.log(last)
        if (inject) inject(el) // Injector
        el.setPanelController(this)
        el.onShow = () => {
          _animating = false
        }
        el.show()

        if (callback) callback()
      })
    }

    // Animate hide current view
    if (_children.length > 0) {
      let last = this._lastChild()
      let el = this.refs[last.ref]
      el.onHide = () => {
        // Show New Panel
        show()
      }
      el.hide()
    } else {
      show()
    }
  }

  /*
   * Pop a Child from stack
   */
  pop(callback) {

    if (_children.length > 0) {
      _animating = true

      let last = this._lastChild()

      this.refs[last.ref].onHide = () => {
        // Remove Ref
        delete this.refs[last.ref]

        // Remove child from stack
        if (_children.length > 0) _children.splice(_children.length -1, 1)
  
        // Animate show child view through force update parent
        let tmpl = this.getRenderableElement()
        tmpl.visible = false
        _parentView.forceUpdate(() => {
          let last = this._lastChild()
          let el = this.refs[last.ref]
          el.onShow = () => {
            _animating = false
          }
          el.show()

          if (callback) callback()
        })
      }
      this.refs[last.ref].hide()
    }
      
  }

  /*
   * Present a Sole Panel on Top
   */
  present(childInfo, callback, inject) {
    _animating = true

    let show = () => {
      // Add new child in stack
      _children.push(childInfo)

      // Get last
      let last = this._lastChild()

      // Animate show child view through force update parent
      _parentView.forceUpdate(() => {
        let el = this.refs[last.ref]
        if (inject) inject(el)
        el.setPanelController(this)
        el.onShow = () => {
          _animating = false
        }
        el.show()

        if (callback) callback()
      })
    }

    // Animate hide current view
    if (_children.length > 0) {
      let last = this._lastChild()
      let el = this.refs[last.ref]
      el.onHide = () => {
        // 새 Panel을 present 하기 전에 root를 제외한 panel들을 모두 지음
        _children = [_children[0]]
        delete this.refs[last.ref]

        // Show New Panel
        show()
      }
      el.hide()
    } else {
      show()
    }
  }

  /*
   * Dismiss Sole Panel if exists
   */
  dismiss(callback) {
    this.pop(callback)
    
  }

  getRenderableElement() {

    let last = this._lastChild()
    if (last) {
      let el = last.el
      return el
    }
    
    return undefined
  }

  _lastChild() {
    return _children[_children.length - 1]
  }

  _animateClean() {
    if (_currentPanel) _currentPanel.hide()
  }
  
}
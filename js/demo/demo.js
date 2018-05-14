/*
 * blueimp Gallery Demo JS
 * https://github.com/blueimp/Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global blueimp, $ */

$(function () {

  var contractAddress = 'n1iqGYDKzs6DmVw7LLRz8tkbaVRXF6y1b94'

  'use strict'
  $('#autocomplete').hide()

  var carouselLinks = []
  var tanMuIntervalArray = []
  var shown = false
  $('#addTag').click(function () {
    add2Contract()
  })

  carouselLinks = [{
    href: 'https://labs.nebulas.io/assets/images/labs/atp.png',
    title: ''
  },
    {
      href: 'https://nebulas.io/assets/images/ni-program.png',
      title: ''
    }

  ]

  // Initialize the Gallery as image carousel:
  var gallery = blueimp.Gallery(carouselLinks, {
    container: '#blueimp-image-carousel',
    carousel: true
  })

  var keyword = ''

  // var addText = document.getElementById("addTag");
  // addText.addEventListener("mouseover", function () {
  //     this.setAttribute("style", "color:#AF4500;")
  // }, false);

  function getFormatDate (timestamp) {
    var a = new Date(timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;

  }

  function shuffle (array) {
    var _array = array.concat()

    for (var i = _array.length; i--;) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = _array[i]
      _array[i] = _array[j]
      _array[j] = temp
    }

    return _array
  }

  var loadTags = function (tagStr, time, from) {
    var tags = tagStr.split(',')
    tags = shuffle(tags)
    tags.forEach(function (tag) {
      setTimeout(function () {
        var sentence = 'receive wish ' + tag + ' from ' + from + ' at ' + getFormatDate(time)
        tanMuTag(sentence)
      }, Math.round(Math.random() * 3000))
    })

  }

  function tanMuTag (tag) {
    var tanMu = document.getElementsByClassName('tanMu')
    var container = document.getElementById('blueimp-image-carousel')
    var tagInput = document.getElementById('tags')
    var tagText = document.createElement('div')
    var mathHeight = Math.round(Math.random() * container.offsetHeight) + 'px'
    var width = container.offsetWidth
    tagText.style.position = 'absolute'
    tagText.style.left = width + 'px'
    tagText.style.top = mathHeight
    tagText.style.fontWeight = '300'
    $(tagText).html(tag).appendTo($(tanMu))
    $(tagText).click(function () {
      tagInput.value = tagText.innerHTML
    })
    // var textLeft = container.offsetWidth + "px";

    var shift = -10
    var x = parseInt(tagText.style.left)
    //
    var tanMuInterval = setInterval(function () {
      if (x < tagText.style.width || x > container.offsetWidth) {
        shift = -shift
      }
      x += shift
      tagText.style.left = x + 'px'
    }, 80)
    tanMuIntervalArray.push(tanMuInterval)
  }

  function httpGetAsync (theUrl, callback) {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText)
    }
    xmlHttp.open('GET', theUrl, true) // true for asynchronous
    xmlHttp.send(null)
  }

  function httpPostAsync (path, params, callback) {
    var request = new XMLHttpRequest()
    request.onload = function () {
      var status = request.status // HTTP response status, e.g., 200 for "200 OK"
      var data = request.responseText // Returned data, e.g., an HTML document.
      callback(data)
    }
    request.open('POST', path, true)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    var param = JSON.stringify(params)
    request.send(param)
  }

  setInterval(function () {
    if (!shown || ($('#tags').val() !== keyword && $('#tags').val() !== '')) {
      keyword = $('#tags').val()
      search()
    }
  }, 1000)

  //var contractAddress = "n1o4GDSQW5kFax7GighCoELFcMHKCJV8oZQ"

  var quote = document.getElementById('quote')
  var username = document.getElementById('username')

  var searchvalue = document.getElementById('searchvalue')

  document.addEventListener('DOMContentLoaded', function () {

    console.log('web page loaded...')
    setTimeout(checkNebpay, 1000)
  })

  function checkNebpay () {
    console.log('check nebpay')
    try {
      var NebPay = require('nebpay')
      console.log(`nebPay installed great`)

    } catch (e) {
      console.log(e)
      if (window.confirm('You dont have the Chrome web wallet extension installed to use this Dapp click Confirm to download now ')) {
        window.location.href = 'https://github.com/ChengOrangeJu/WebExtensionWallet'
      }
    }
  }

  function search () {

    searchvalue = document.getElementById('tags').value

    var func = 'get'
    var args = '["' + searchvalue + '"]'
    console.log(`you search for ${searchvalue}`)

    window.postMessage({
      'target': 'contentscript',
      'data': {
        'to': contractAddress,
        'value': '0',
        'contract': {
          'function': func,
          'args': args
        }
      },
      'method': 'neb_call'
    }, '*')
  }

  function add2Contract () {

    username = document.getElementById('tags').value
    quote = document.getElementById('tag').value

    username = username.toLowerCase()

    console.log('-------Add to the Smart Contract------')
    var func = 'save'
    var args = '["' + username + '","' + quote + '"]'

    window.postMessage({
      'target': 'contentscript',
      'data': {
        'to': contractAddress,
        'value': '0',
        'contract': {
          'function': func,
          'args': args
        }
      },
      'method': 'neb_sendTransaction'
    }, '*')
  }

  window.addEventListener('message', function (e) {

    try {
      var getResults = e.data.data.neb_call.result

      if (getResults != undefined && getResults !== 'null') {

        shown = true

        console.log('getResult： ' + getResults)

        var result = JSON.parse(getResults)['content']
        var time = JSON.parse(getResults)['time']
        var from = JSON.parse(getResults)['from']

        blueimp.Gallery(carouselLinks, {
          container: '#blueimp-image-carousel',
          carousel: true,
          slideshowInterval: 10000,
          onopen: function () {
            // Callback function executed when the Gallery is initialized.
          },
          onopened: function () {
            // Callback function executed when the Gallery has been initialized
            // and the initialization transition has been completed.
          },
          onslide: function (index, slide) {
            // Callback function executed on slide change.
          },
          onslideend: function (index, slide) {
            var tanMu = document.getElementsByClassName('tanMu')
            $(tanMu).empty()
            tanMuIntervalArray.forEach(function (tanMuInterval) {
              clearInterval(tanMuInterval)
            })

            loadTags(result, time, from)
          },
          onslidecomplete: function (index, slide) {

          },
          onclose: function () {
            // Callback function executed when the Gallery is about to be closed.
          },
          onclosed: function () {
            // Callback function executed when the Gallery has been closed
            // and the closing transition has been completed.
          }
        })

      } else {

        shown = false

        var links = [{
          href: 'https://wineandcrisps.wordpress.com/',
          title: ''
        }

        ]

        $('#autocomplete').show()
        $('.tanMu').empty()

        blueimp.Gallery(links, {
          container: '#blueimp-image-carousel',
          carousel: true,
          slideshowInterval: 10000,
          onopen: function () {
            // Callback function executed when the Gallery is initialized.
          },
          onopened: function () {
            // Callback function executed when the Gallery has been initialized
            // and the initialization transition has been completed.
          },
          onslide: function (index, slide) {
            // Callback function executed on slide change.
          },
          onslideend: function (index, slide) {

          },
          onslidecomplete: function (index, slide) {

          },
          onclose: function () {
            // Callback function executed when the Gallery is about to be closed.
          },
          onclosed: function () {
            // Callback function executed when the Gallery has been closed
            // and the closing transition has been completed.
          }
        })

      }

    } catch (e) {
      if (e == undefined) {
        console.log(`results were undefined`)
      }
    }
  })
})





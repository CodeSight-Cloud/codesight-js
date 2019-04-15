<p align="center">
    <img src="./images/logo-text.svg">
</p>

> Codesight, runtime insights at dev time.

JavaScript client for capturing events in web browsers or nodejs for [CodeSight](https://codesight.cloud).

## Installation

yarn
```
yarn add @codesight/codesight-js
```

npm
```
npm i @codesight/codesight-js
```

script tag
```html
<script src="https://unpkg.com/codesight-js@1.0.0/dist/index.js"></script>
```

inline script
```html
<script>
!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((n=n||self).cdst={})}(this,function(t){"use strict";function s(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}var i,n;(n=i||(i={}))[n.function=0]="function";var a="platform.codesight.cloud",c="/api/1/session",e=function n(e){var r=this;!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),s(this,"session",void 0),s(this,"_onEvent",function(n,e){r.session.events[n]=e}),s(this,"invoke",function(n,e){var t=encodeURIComponent(n+e),s=r.session.events[t];s?s.count++:s={name:n,file:e,count:1,type:i.function},r._onEvent(t,s)}),s(this,"startSession",function(n){return r.session={id:function(){function n(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return n()+n()+"-"+n()+"-"+n()+"-"+n()+"-"+n()+n()+n()}(),apiKey:n.apiKey,project:n.project,environment:n.environment,start:new Date,end:null,events:{}},r.session}),s(this,"closeSession",function(){return r.session.end=new Date,r.session}),s(this,"postSession",function(){var n=!(0<arguments.length&&void 0!==arguments[0])||arguments[0];if(0<Object.keys(r.session.events).length)if(XMLHttpRequest){var e=new XMLHttpRequest;e.open("POST","https://"+a+c,n),e.setRequestHeader("Content-type","application/json; charset=utf-8"),e.onreadystatechange=function(){4===e.readyState&&204===e.status&&(r.session.events={})},e.send(JSON.stringify(r.session))}else if(require){var t=require("https"),s=JSON.stringify(r.session),i={hostname:a,port:443,path:c,method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","Content-Length":s.length}},o=t.request(i,function(n){n.on("data",function(){r.session.events={}})});o.write(s),o.end()}}),s(this,"postSessionAndExit",function(){process&&(r.closeSession(),r.postSession(),setTimeout(function(){process.exit()},5e3))}),this.session=this.startSession(e),setInterval(this.postSession.bind(this,!1),e.interval||3e4),window&&window.addEventListener("beforeunload",function(){r.closeSession(),navigator.sendBeacon?navigator.sendBeacon("https://"+a+c,JSON.stringify(r.session)):r.postSession(!1)})};t.instance={invoke:function(){},startSession:function(){},closeSession:function(){},postSession:function(){}};t.Client=e,t.initialize=function(n){return t.instance=new e(n),t.instance},t.i=function(n,e){t.instance.invoke(n,e)},Object.defineProperty(t,"__esModule",{value:!0})});
</script>
```

## Setup

## Basic Usage

First you need to initialize the client with your API key, project Id and environment Id. These can be found in your envrionment from [CodeSight.cloud](https://platform.codesight.cloud).

```js
import * as cdst from 'codesight-js';

cdst.initialize({
    apiKey: '',
    project: '',
    envrionment: '',
    error: false, // optional, defaults to false
    interval: 30000, // optional, defaults to 30000
});
```

**interval**

Number of milliseconds to wait between sending session data back to CodeSight. Defaults to 30 seconds.

Function calls can then be reported to CodeSight using:

```js
// myFunction: Function Name
// aW5kZXguanM=: LZ compressed base64 encoded filename (index.js) relative to .codesight file
cdst.i('myFunction', 'aW5kZXguanM=');
```

The [VSCode extension](https://marketplace.visualstudio.com/items?itemName=codesight.CodeSight) (highly recommended) adds a command to add an `invoke` call and will automatically generate the LZ compressed base64 encoded filename.

Session data will be automatically sent back to CodeSight every 30 seconds (or the interval you configured during
initialization).

Session data can be sent back manually at any point using:

```js
// Or via exposed postSession
cdst.postSession();
```

When initializing the client an event handler to `beforeunload` is attached (if running in a browser environment), this event handler will close the session
and send back any remaining session data.

When running in a nodejs envrionment you can call `cdst.postSessionAndExit` to post back the session data, after 10 seconds `process.exit` will be called.

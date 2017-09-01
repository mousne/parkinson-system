# ruiyun-web

> A new version of ruiyun web

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test

# compile element-theme css
npm run et
```

### 如果 npm install 的时候出现 'PhantomJS not found on PATH'，并且进度条卡住不动的话，怎么办？

这是由于天朝的防火墙引起的，可以借助淘宝镜像来解决这个问题。用下面的命令单独安装 **phantomjs-prebuilt**

`PHANTOMJS_CDNURL=https://npm.taobao.org/mirrors/phantomjs/ npm install phantomjs-prebuilt --save-dev`

如果你不想输入这么长的命令，那也可以在 **~/.npmrc** 文件中加入这一行

`phantomjs_cdnurl = https://npm.taobao.org/mirrors/phantomjs/`

然后就可以正常 npm install 了。不过据我测试，有了 **package-lockage.json** 文件的帮助（因为它已经把每个依赖的下载地址指向了淘宝镜像），应该不会再出现进度条卡住的问题。详细情况请参考[这里](https://github.com/xhlwill/blog/issues/11)

### 如果 npm install 的过程太慢，甚至因为延时而导致错误，怎么办？

依然类似于上面的解决办法，借助淘宝镜像来下载依赖模块。将 'registry = https://registry.npm.taobao.org' 写入 **~/.npmrc** 文件，再 npm install 就会快很多。不过还是因为 **package-lockage.json** 的存在，你一般不会遇到这个问题。

## 项目结构
对于最外层的组件，是按照路由信息进行加载的。比方说你点击了菜单中的选项，就会直接改变路由，再根据 **src/router/index.js** 找到到底该加载哪些组件，而如果你直接在浏览器地址栏改变路由，也会起到同样的作用。也就是说，这些外层组件加载的决定因素就是路由地址。但是对于层级很深的子组件来说，并没有路由信息去表达这个状态。例如在毒物接触史当中添加一个新记录，这个时候路由信息是不会有变化的，一旦点击网页刷新，就会回到路由地址所能控制到的最深层级，而放弃这些层级过深的子组件。更多详情需要参看 [Vue-Router 官网](https://router.vuejs.org/zh-cn/) 。

另一个需要特别说明的是 Vuex。原则是，只在必要的情况下，才使用 Vuex 管理全局状态。包含在组件内部的数据就使用 Vue 的标准方式来进行包裹和传递。对于像 token，dictionary，typeGroup 这些不属于特定组件的信息，我们采用 Vuex 的方式对其进行管理。

## 关于element-theme

**src/assets/styles/** 目录下有个 **element-variables.css** 文件，以 CSS4 的格式规定了 element-ui 组件的自定义样式。我们利用它来编译出项目实际使用的 CSS，输出路径是 **src/assets/styles/element-theme**。

编译工具是 **node_modules** 中的 **element-theme** 组件，这样我们就能用 `et` 命令对 **element-variables.css** 进行编译：

`node_modules/.bin/et -c src/assets/styles/element-variables.css -o src/assets/styles/element-theme`

此命令被封装在 **package.json** 的脚本中，因此执行 `npm run et` 即可。

## 模态框
本项目多处使用到模态框，基本思想参考于知乎上[尤雨溪的回答](https://www.zhihu.com/question/35820643/answer/64646527#)。状态驱动，挂载在根组件，然后由子组件触发事件传递上来。

## 关于组件之间的通信

如果是父子组件之间的通信，则由子组件调用 `this.$emit()` 方法，父组件采用 `v-on` 进行监听就好了。如果是层级关联度较低的组件，则加入一个第三方的 Vue 实例对象充当中转站的作用，我们这里定义在了 **src/utils/bus.js** 中，使用的时候先 `import Bus from 'utils/bus.js'`，然后使用 `Bus.$emit()` 和 `Bus.$on()` 即可。值得注意的是，在组件卸载的时候记得解除建立在 `Bus` 上的事件监听，因为绑定的回调函数不会随着组件卸载而自动销毁，一旦再次发生相应事件，则会报错。因此，对于使用了 `Bus.$on()` 的组件，需要在它的 `beforeDestroy` 钩子中，执行 `Bus.$off()`，将相关事件监听全部解除。详情参考[官网](https://cn.vuejs.org/v2/api/#vm-off-event-callback)。

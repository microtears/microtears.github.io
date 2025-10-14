# 鸿蒙应用分享-懂车帝

分享人：陈庆伟

Note: 2024-12-04

大家好，我是懂车帝鸿蒙应用团队的研发陈庆伟，今天我向大家分享的主题是懂车帝鸿蒙版应用内路由的演变。

---

## 业务&技术实践

懂车帝应用内路由演变

---

### 鸿蒙路由方案能力对比

| 业务场景                       | Navigation                            | Router                                 |
| ------------------------------ | ------------------------------------- | -------------------------------------- |
| 一多能力                       | 支持，Auto模式自适应单栏跟双栏显示    | 不支持                                 |
| 跳转指定页面                   | pushPath & pushDestination            | pushUrl & pushNameRoute                |
| 获取指定页面参数               | 支持                                  | 不支持                                 |
| 传参类型                       | 传参为对象形式                        | 传参为对象形式，对象中暂不支持方法变量 |
| 清理指定路由                   | removeByIndexes & removeByName        | 不支持                                 |
| 自定义转场动画                 | 支持                                  | 支持，动画类型受限                     |
| geometryTransition共享元素动画 | 支持（NavDestination之间共享）        | 不支持                                 |
| 页面生命周期监听               | UIObserver.on('navDestinationUpdate') | UIObserver.on('routerPageUpdate')      |
| 获取页面栈对象                 | 支持                                  | 不支持                                 |
| 路由拦截                       | 支持通过setInercption做路由拦截       | 不支持                                 |
| 路由栈信息查询                 | 支持                                  | getState() & getLength()               |
| 路由栈move操作                 | moveToTop & moveIndexToTop            | 不支持                                 |
| 沉浸式页面                     | 支持                                  | 不支持，需通过window配置               |

Note:

考虑到有些人可能没有接触过Router，所以我这里简单介绍一下，Router是华为在 Navigation 出现之前向开发者提供了一套应用内路由组件，它跟 Navigation 一样都支持常见的页面跳转，页面返回，命名路由等功能。
但是它本身其实也有一些缺陷，比如说对于路由内的页面数量上限有一定的限制，以及它不支持 Dialog 这种样式的路由。
下面是这里是我列出来了一些 Navigation 跟 Router 之间的一些能力对比，也就是他们的主要的一些差异啊。可以看到相比于Router来说它的能力更加强大。

---

### 最初方案

手写 import 语句

```typescript [2-4]
// 差异配置
import(
  "../../../../../../business/main_frame/carpick/src/main/ets/featureconfig/CarDiffEntry"
);
// 条件选车
import(
  "../../../../../../business/main_frame/carpick/src/main/ets/carfilter/CarFilterEntry"
);
...
```

Note:

由于懂车帝鸿蒙版项目的启动时间比较早，所以我们在一开始使用的就是 Router 这个路由组件。而对于Router 来说，我们想要进行页面跳转的话，必须要手写这种 import 语句，然后再调用 Router 的 pushNamedRouter 这个方法才可以进行跳转。
但是可以看到手动编写这种语句其实有不少缺点：
一个就是它需要是完整的路径，
其次他没有编译时检查，
这就很容易出错。
而且每一次调用push方法都需要先import目的地页面，
但是由于我们在多端都采用的是下发schema进行跳转，在跳转的时候我们其实并不知道目的地是什么。
所以对于以上种种，我们引入了编译时代码生成技术来解决问题。

--

调用 push 方法

```typescript
router.pushNamedRoute({ name: option.name, params: option.param });
```

Note:

由于懂车帝鸿蒙版项目的启动时间比较早，所以我们在一开始使用的就是 Router 这个路由组件。而对于Router 来说，我们想要进行页面跳转的话，必须要手写这种 import 语句，然后再调用 Router 的 pushNamedRouter 这个方法才可以进行跳转。
但是可以看到手动编写这种语句其实有不少缺点：
一个就是它需要是完整的路径，
其次他没有编译时检查，
这就很容易出错。
而且每一次调用push方法都需要先import目的地页面，
但是由于我们在多端都采用的是下发schema进行跳转，在跳转的时候我们其实并不知道目的地是什么。
所以对于以上种种，我们引入了编译时代码生成技术来解决问题。

---

### 生成 import 语句

通过 hvigor task 在编译时生成代码

```typescript
// 生成route for navigation
pluginContext.registerTask({
  name: "generateNavigationRoutes",
  run: (taskContext) => generateNavigationRoutes(project.getNodeDir()),
  dependencies: [],
  postDependencies: ["default@PreBuild"],
});
```

Note:

通过hvigor task，我们做到了在编译时通过解析Entry装饰器来识别应用内的每一个路由页面。
这部分就是在我们在编译时生成的import代码，可以看到跟手写的那部分内容并没有什么区别。但是现在开发人员不再需要关注每一次路由跳转需要import哪些内容。

--

```typescript [4]
// AUTO-GENERATED FILE. DO NOT MODIFY!
function importAll() {
  // routeName: about_dcd
  import('../../../../../../business/content/profile/src/main/ets/settings/AboutDCDPage')
  // routeName: account_edit
  import('../../../../../../business/content/profile/src/main/ets/settings/useredit/AccountEditPage')
  ...
}
```

Note:

通过hvigor task，我们做到了在编译时通过解析Entry装饰器来识别应用内的每一个路由页面。
这部分就是在我们在编译时生成的import代码，可以看到跟手写的那部分内容并没有什么区别。但是现在开发人员不再需要关注每一次路由跳转需要import哪些内容。

---

### 同一页面内组件之间传递 Show/Hide 事件

```typescript [2]
export class PageEventSource {
  get onPageVisibilityChange(): Listenable<boolean>;

  dispose(): void;
}
```

缺陷：Consume不支持可空的/本地初始化，导致预加载时没有 Provide 发生运行时异常。

issue：[go/detail/240829163137107](https://issuereporter.developer.huawei.com/detail/240829163137107/comment)

Note:

随着业务发展我们遇到了一个问题，我们需要在同一页面内的组件之间，去传递页面的可见性的事件。
由于Router只支持在Entry装饰的组件内部监听onPageShow/onPageHide事件，
所以我们设计了一个PageEventSource这样一个组件，它利用了鸿蒙提供的Provide/Consume机制，将Entry组件的页面可见性事件广播到每一个子组件。

但是后来我们在做性能优化的时候又遇到了一个棘手的问题。
问题的起因是因为有部分预加载的组件依赖PageEventSource，但是由于在预加载阶段，它还没有展示在页面之上，所以此时并没有PageEventSource Provider. 这就导致了运行时异常。
这个问题的本质原因主要是因为被Consume 装饰的属性，它不支持可空或者说本地初始化，如果大家想了解这个信息，可以点击下面的issue查看详情。

---

### 支持任意组件拦截返回事件(Part I)

```typescript
type OnBackPressedCallback = () => boolean;

export class OnBackPressedDispatcher {
  addCallback(callback: OnBackPressedCallback);

  removeCallback(callback: OnBackPressedCallback);

  takePriority(callback: OnBackPressedCallback);

  dispatch(): boolean;

  dispose(): void;
}
```

Note:

接下来的一个业务诉求就是需要支持在任意组件去拦截返回事件，为了支持这个功能，我们设计了OnBackPressedDispatcher 这样一个组件，然后在原来的PageEventSource 的基础上暴露了这样一个API。

---

### 支持任意组件拦截返回事件(Part II)

```typescript [2]
export class PageEventSource {
  get onBackPressedDispatcher(): OnBackPressedDispatcher;

  get onPageVisibilityChange(): Listenable<boolean>;

  dispose(): void;
}
```

Note:

接下来的一个业务诉求就是需要支持在任意组件去拦截返回事件，为了支持这个功能，我们设计了OnBackPressedDispatcher 这样一个组件，然后在原来的PageEventSource 的基础上暴露了这样一个API。

---

### 支持任意组件拦截返回事件(Part III)

这是到目前为止我们 Entry 组件的样子：

```typescript [4-5|7-9|11-13|15-17|19-20]
@Entry({ routeName: 'ugc_detail' })
@Component
export struct UgcVideoPage {
  @Provide
  eventSource: PageEventSource = new PageEventSource()

  onPageShow(): void {
    this.eventSource.onPageVisibilityChange.notifyListeners(true)
  }

  onPageHide(): void {
    this.eventSource.onPageVisibilityChange.notifyListeners(false)
  }

  onBackPress(): boolean | void {
    return this.eventSource.onBackPressedDispatcher.dispatch()
  }

  aboutToDisappear(): void {
    this.eventSource.dispose()
  }

}
```

必须要添加 eventSource，手动重写 onPageShow、onPageHide、onBackPress，以及
aboutToDisappear，否则会导致逻辑错误。

Note:

这个就是到目前为止我们 entry 组件中的样子。首先每一个 entry 组件它必须要手动添加PageEventSource Provider，还需要手动去重写onPageShow、onPageHide，onBackPress以及aboutToDisappear这些API，否则的话在运行时就会导致逻辑错误。

---

### 迁移 Navigation

#### 背景

Router路由后续将不做演进，系统路由推荐从Router切换到Navigation。

同时由于Router的不支持 Dialog 路由，无法通过 schema 弹起
dialog，因此我们也希望能通过Navigation实现Dialog路由功能。

Note:

然后时间到了今年3月，我们收到了华为那边的一个通知，他们说 Router 后续就不会再做演进了，他们希望开发者把路由组件从 Router 切换到 navigation。
同时，前文提到，Router不支持 Dialog 路由，也没有办法通过 schema 在任意页面去弹起一个Dialog弹窗，这是我们的一个痛点。恰好 Navigation 提供了这些能力，所以我们进行了调研，希望可以通过新的 navigation 组件提供的能力去实现 Dialog 路由的功能。

--

#### 方案：包装现有 Entry 组件

切换到 Navigation 会导致原本的 onPageShow、onPageHide、onBackPress，这三个

API 不再生效，但由于我们从一开始就是用来 PageEventSource

在组件间直接传递页面事件，所以这里只需要在下面的 Wrapper 中利用 Navigation 新的

API将事件转发到PageEventSource，其余组件均无需改动。

Note:

然而切换Navigation 并不简单，它需要将原本的Entry组件包裹在NavDestination组件里，而且还会导致原本的 Entry 组件的onPageShow、onPageHide、onBackPress这三个 API不再生效，但是由于我们一开始就是采用了PageEventSource这种方式在组件间传递事件，所以对我们来说API失效的影响其实没有那么大，反而是第一个要求。对我们影响来说更大。
当我们接到华为通知的时候，端内已经有 100 多个页面，所以从一开始就否决了手动修改这条路，这样成本太高了，最终我们还是选择了代码生成的方案，通过生成代码包裹现有的Entry组件来满足第一个要求。
再然后我们在生成的组件中利用Navigation新的API将事件转发到PageEventSource，其余的组件不需要做改动，这样就以一种低成本，业务无感知的方式完成了从Router到Navigation的迁移，整体的用时不到2天。

--

#### Demo

```typescript
// 以下代码可以通过编译期生成

@Builder
export function SeriesDetailEntryNavDestinationBuilder(params: object) {
  NavDestination() {
    SeriesDetailEntry({
      args: params as Record<string, string>,
    })
  }.hideTitleBar(true)
    .onShown(() => {
      // TODO：分发事件
    })
    .onHidden(() => {
      // TODO：分发事件
    })
    .onBackPressed(() => {
      // TODO：分发事件
      return false
    })
}

const builder: WrappedBuilder<[object]> = wrapBuilder(SeriesDetailEntryNavDestinationBuilder);
AutoNavigation.addBuilder("concern", builder)
```

Note:

下面这是一个demo就是我们在调研阶段手动编写的代码。

---

### 依旧使用功能代码生成方案

```typescript [20-24]
// AUTO-GENERATED FILE. DO NOT MODIFY!

@Component
export struct AboutDCDPageProvide {
  @Prop params?: object = undefined;
  @Provide({ allowOverride: "eventSource" }) eventSource: PageEventSource = new PageEventSource("about_dcd", this.params)

  build() {
    PageWrapper({
      destinationMode: NavDestinationMode.STANDARD,
      params: this.params,
      routerName: "about_dcd",
    }) {
      AboutDCDPage()
    }
  }
}

@Builder
function AboutDCDPageNavDestinationBuilder(context: NavigationContext) {
  AboutDCDPageProvide({params: context.getParams()})
}

AutoNavigation.addBuilder("about_dcd", wrapBuilder(AboutDCDPageNavDestinationBuilder))
```

理论上我们只需要生成每个页面的 Builder 以及 addBuilder 调用。

为什么这里还需要 PageProvide 组件？ 这同样是 JS 的一个限制：

[尾随闭包情况下provide未定义错误](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-provide-and-consume-0000001820879589#ZH-CN_TOPIC_0000001857876921__builderparam%E5%B0%BE%E9%9A%8F%E9%97%AD%E5%8C%85%E6%83%85%E5%86%B5%E4%B8%8Bprovide%E6%9C%AA%E5%AE%9A%E4%B9%89%E9%94%99%E8%AF%AF)

Note:

这个就是我们最终编译时生成的代码。这里面最关键的就是 builder 函数以及 add builder 调用。
但可以看到这里还是生成了一个 PageProvide 的组件。理论上来说我们每个页面只需要生成每个页面对应的 builder 以及 add builder 的调用，但是这里为什么还需要一个生成这样一个 PageProvide 组件呢？
其实这还是 JS 本身的一个限制，就是尾随闭包跟Provide组件不能共同使用。

---

### 在PageWrapper 组件内对每个页面公共逻辑进行统一处理

```typescript [10-13|15-21|23-26|29-54|55-77]
@Component
export struct PageWrapper {
  @BuilderParam pageBuilder: () => void;
  @Prop destinationMode: NavDestinationMode = NavDestinationMode.STANDARD;
  @Consume private eventSource: PageEventSource
  @Prop params?: object = undefined;
  @Prop routerName?: string = undefined;
  @State longTakeSession: LongTakeSession = new LongTakeSession()

  aboutToAppear(): void {
    GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.ABOUT_APPEAR)
    AutoContinue.createData(this.eventSource.pageUniqueId)
  }

  onBackPress(): boolean {
    const result = this.eventSource.onBackPressedDispatcher.dispatch();
    if (!result) {
      AutoNavigation.setResult(undefined)
    }
    return result;
  }

  aboutToDisappear(): void {
    this.eventSource.dispose()
    AutoContinue.destroyData(this.eventSource.pageUniqueId)
    GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.ABOUT_DISAPPEAR)
  }

  build() {
    NavDestination() {
      LongTakeTransitionDelegate({
        longTakeSession: this.longTakeSession
      }) {
        this.pageBuilder()
      }
    }
    .hideTitleBar(true)
    .mode(this.destinationMode)
    .onWillAppear(() => {
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.WILL_APPEAR)
    })
    .onAppear(()=>{
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.APPEAR)
    })
    .onWillShow(() => {
      this.triggerPrePageEventFromDialog(NavigationEvent.WILL_HIDE);
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.WILL_SHOW)
    })
    .onShown(() => {
      this.eventSource.onPageVisibilityChange.notifyListeners(true)
      AutoContinue.activeData(this.eventSource.pageUniqueId)
      this.triggerPrePageEventFromDialog(NavigationEvent.PAGE_HIDE);
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.PAGE_SHOW)
    })
    .onWillHide(() => {
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.WILL_HIDE)
      this.triggerPrePageEventFromDialog(NavigationEvent.WILL_SHOW);
    })
    .onHidden(() => {
      this.eventSource.onPageVisibilityChange.notifyListeners(false)
      AutoContinue.inactiveData(this.eventSource.pageUniqueId)
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.PAGE_HIDE)
      this.triggerPrePageEventFromDialog(NavigationEvent.PAGE_SHOW);
    })
    .onWillDisappear(() => {
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.WILL_DISAPPEAR)
    })
    .onDisAppear(() => {
      GlobalPageEventRegistry.onEvent(this.eventSource.pageUniqueId, NavigationEvent.DISAPPEAR)
    })
    .onBackPressed(() => {
      return this.onBackPress()
    })
    .onReady((context: NavDestinationContext) => {
      this.longTakeSession.tryCustomNavigation(this.getUIContext(), context.navDestinationId, this.params)
    })
  }

  private triggerPrePageEventFromDialog(event: NavigationEvent) {
    if (this.destinationMode === NavDestinationMode.DIALOG) {
      GlobalPageEventRegistry.onEvent(GlobalPageEventRegistry.getPrePageUniqueId(this.eventSource.pageUniqueId), event)
    }
  }
}
```

由于 ArkTs 构建 UI 的方式主要是通过组合来实现，所以并不能像 Android 中的 Activity 一样，通过继承 BaseActivity 来实现页面公共逻辑；

所以这里我们通过代码生成的方式，让每一个页面都包裹在 PageWrapper 这个组件中，做到了这件事。

Note:

接下来就是对每个页面公共逻辑的处理。
由于 ArkTs 构建 UI 的方式主要是通过组合来实现，所以并不能像 Android 中的 Activity 一样，通过继承 BaseActivity 来实现页面公共逻辑；
所以这里我们通过代码生成的方式，让每一个页面都包裹在 PageWrapper 这个组件中，做到了这件事。

---

### 支持 Dialog

只需要添加一个@Dialog 装饰器

```typescript [1]
@Dialog
@Entry({ routeName: 'my_dialog' })
@Component
export struct MyDialog {

}
```

Note:

接下来对于Dialog的支持就非常简单了，我们只需要在原有的Entry组件基础上添加一个 Dialog 装饰器，就可以实现 Dialog 路由。

--

生成的代码只有一行区别

```typescript [5]
@Component
export struct ReportDialogProvide {
  build() {
    PageWrapper({
      destinationMode: NavDestinationMode.DIALOG,
      params: this.params,
      routerName: "report_dialog",
    }) {
      ReportDialog()
    }
  }
}
```

Note:

对于生成的代码与原来只有一行区别。

---

### 更易用的 API

```typescript
export function showDialog(builderParams: DcdDialogBuilderParams) {
  SchemaUtils.push(DCD_DIALOG_CONTAINER_PAGE_URL, builderParams);
}
```

Note:

我们也提供了跟原有 showCustomDialog 相仿的API，方便大家的使用。

---

### 如何实现动态import路由页面

将生成的 import 包裹在闭包中，在路由跳转前执行。

```typescript [4-8]
export function registerRoutes(
  routes: Map<string, () => Promise<object | undefined>>,
) {
  routes.set("about_dcd", (): Promise<object> => {
    return import(
      "../../../../../../../business/content/profile/src/main/ets/gen/routes/AboutDCDPageRoute"
    );
  });
  routes.set("account_edit", (): Promise<object> => {
    return import(
      "../../../../../../../business/content/profile/src/main/ets/gen/routes/AccountEditPageRoute"
    );
  });
}
```

Note:

接下来就是如何去实现动态import路由页面，要知道import它本身是一个耗时操作，在启动阶段一次性import所有路由页面虽然更简单，但这并不是一个好的行为。
我们思路就是将原本的 import 语句替换为 import 闭包来实现。
将生成的 import 语句包裹在闭包中，然后在路由跳转之前执行，就可以完成动态import路由页面。

--

在路由拦截器中拦截处理。

```typescript [3]
export async function dynamicImportHandler<T>(context: NavigationContext<T>) {
  if (!isHttpUrl(context.option.schema)) {
    await AutoNavigationRegister.dynamicImport(context.option.url.host);
  }
  context.next();
}
```

Note:

调用的时机就是在路由真正跳转之前。

---

### 更好的事件传递方案

```typescript [3-6]
export type NavigationEventCallback = (event: NavigationEvent,  pageUniqueId: string) => void;

GlobalPageEventRegistry.registerCallback( /*lifecycleOwner*/ this, (event) => {
  this.onPageEventReceived(event);
}, AutoNavigation.getCurrentContext().option.pageUniqueId);

export enum NavigationEvent {
  ABOUT_APPEAR = "AboutAppear",
  WILL_APPEAR = "WillAppear",
  APPEAR = "Appear",
  WILL_SHOW = "WillShow",
  PAGE_SHOW = "PageShow",
  WILL_HIDE = "WillHide",
  PAGE_HIDE = "PageHide",
  WILL_DISAPPEAR = "WillDisappear",
  DISAPPEAR = "Disappear",
  ABOUT_DISAPPEAR = "AboutDisappear",
}
```

Note:

在迁移到Navigation之后，我们也注意到Navigation相比于Router，提供了更多的生命周期事件，这个时候再采用PageEventSource就不是那么合适了，所以我们也探索出了一些新的方案：
我们设计了这样一个组件，它作为单例提供了 register 跟 unregister 两个API，可以让开发者去注册自己的路由事件的监听器。

--

和鸿蒙官方新出的方案如出一辙：[observer.on('navDestinationUpdate')](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-arkui-observer-V5#observeronnavdestinationupdate)

```typescript
uiObserver.on("navDestinationUpdate", (info) => {
  console.info("NavDestination state update", JSON.stringify(info));
});
```

解决了预加载时没有 Provide 导致 Crash 的问题。

支持更全面的事件。

与组件解耦，可以代码中任意位置感知页面生命周期。

更好的与组件的生命周期进行绑定，在组件销毁的时候组到自动取消监听。

Note:

可以看到它和鸿蒙官方后来新出的方案是如出一辙，在使用形式以及方式上是极其相似的，而这种新的 API 解决了我们之前提到个各种问题。
比如说我们之前提到的在预加载时候没有 provide 会导致 crash 的问题。
而且相比原来的PageEventSource，它支持了更全面的路由事件。
再一个就是它和组件进行了解耦，新的事件传递方案不再依赖于组件级别的 provide 跟 consume 机制，可以在代码中的任意位置去感知页面的生命周期。
最后就是它可以很好地跟我们的组件生命周期能力进行结合，可以做到在组件销毁的时候去自动取消监听，防止内存泄露。

---

## 后续规划

路由参数自动解析

类型安全的路由参数传递

Note:

以上就是我们到目前为止在懂车帝鸿蒙版应用内路由遇到的一些问题以及解决方案，我们后续的规划就是希望做到路由参数的自动解析，以及编译时类型安全的一个路由参数传递方案，谢谢大家。

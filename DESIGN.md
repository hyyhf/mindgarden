---
name: "心智庭院 / Mind Garden"
description: "以晨光、宣纸与石庭承载私人反思的新中式心智空间。"
colors:
  morning-paper: "#F8EEE1"
  porcelain-paper: "#FFFAF2"
  limestone: "#EAD8C0"
  deep-ink: "#342D27"
  secondary-ink: "#76695E"
  indigo-action: "#405F87"
  indigo-deep: "#304C70"
  plum-record: "#8D5A5E"
  restrained-brass: "#A77D43"
  semantic-sage: "#71806E"
typography:
  display:
    fontFamily: "Mind Garden Display, Noto Serif SC, Source Han Serif SC, serif"
    fontSize: "clamp(40px, 4vw, 54px)"
    fontWeight: 560
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Mind Garden Display, Noto Serif SC, Source Han Serif SC, serif"
    fontSize: "24px"
    fontWeight: 560
    lineHeight: 1.3
  body:
    fontFamily: "Noto Sans SC, Source Han Sans SC, PingFang SC, Microsoft YaHei UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Noto Sans SC, Source Han Sans SC, PingFang SC, Microsoft YaHei UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 620
    lineHeight: 1.5
rounded:
  control-sm: "7px"
  control: "10px"
  material: "12px"
  focal-sheet: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.indigo-action}"
    textColor: "{colors.porcelain-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.porcelain-paper}"
    textColor: "{colors.indigo-action}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "46px"
  station-sheet:
    backgroundColor: "{colors.porcelain-paper}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.material}"
    padding: "14px 16px 13px"
  text-field:
    backgroundColor: "{colors.porcelain-paper}"
    textColor: "{colors.deep-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
---

# Design System: 心智庭院 / Mind Garden

## Overview

**Creative North Star: “晨光造物室”**

心智庭院是一间被晨光照亮的当代新中式造物室：温暖但不甜腻，克制但不冷淡，空间感来自真实的宣纸、浅木、石灰岩、白瓷与黄铜，而不是层层圆角卡片。界面先让用户看见一处有记忆点的场景，再让操作、状态和记录沿着场景的秩序自然展开。

它是一款严肃的私人反思工具。每个视觉选择都要让“由你决定、加密保存、候选待确认、可返回对话”更容易理解；新中式只提供材质和节奏，不替代语义、功能或证据。

**Key Characteristics:**

- 温暖米色建筑场与低对比宣纸底纹。
- 深墨正文、靛蓝行动、梅色记录、黄铜连接，绿色只表示少量成功状态。
- 一页一个空间焦点，不把每段内容塞进同尺寸卡片。
- 桌面保持建筑式横向构图，移动端重排为清晰的纵向路径。
- 真实栅格材质与语义 HTML 并存；图像永不烘焙用户内容或控件。

## Colors

主画面是暖象牙与石灰岩，墨色负责阅读，靛蓝负责动作与选中；梅色和黄铜只作为记录与连接的稀疏信号。

### Primary

- **庭院靛蓝**：主要按钮、当前路线、关键选择和深色功能平面。大面积深色只用于确有意义的专注区域。
- **深庭院靛蓝**：主要按钮悬停及需要更强层级的靛蓝表面。

### Secondary

- **旧金黄铜**：标志、路径节点、今日标记和物理连接细节，不承担大段文本。
- **梅枝记录色**：已保存回望、待处理记录和少量人文提示。

### Tertiary

- **节制鼠尾草**：仅用于成功、确认与安全状态，不能成为页面基调或大面积背景。

### Neutral

- **晨光宣纸**：默认画布与开放内容平面。
- **白瓷纸面**：控件、轻量浮层和高亮纸片。
- **暖石灰岩**：场景台阶、分区过渡与温暖深层底色。
- **深墨**：正文和关键标题。
- **次墨**：说明、时间与辅助信息。

### Named Rules

**The Warm Field Rule.** 浅色界面始终由暖宣纸或石灰岩统领，禁止漂成纯白后台或绿色健康仪表盘。

**The One Action Color Rule.** 靛蓝是唯一通用行动色；梅色、黄铜与绿色必须保持语义稀缺性。

## Typography

**Display Font:** Mind Garden Display，回退到 Noto Serif SC / Source Han Serif SC。

**Body Font:** Noto Sans SC，回退到 Source Han Sans SC / PingFang SC / Microsoft YaHei UI。

**Character:** 标题使用有书卷气但不过度仿古的中文衬线体，正文使用 Noto Sans SC 的清洁笔画承担长时间阅读。两者的差异提供编辑感，不靠粗黑、全大写或装饰字制造层级。

### Hierarchy

- **Display**（560，响应式 40–54px，1.12）：每个空间只出现一次，移动端仍保留明显尺度。
- **Title**（560，24px，1.3）：内容区和关键功能组标题。
- **Body**（400，14px，1.75）：说明、记录和表单正文；连续解释控制在约 65–75 个字符宽度内。
- **Label**（620，11px，1.5）：状态、元数据和紧凑控件，避免把它放成标题上方的眉题。

### Named Rules

**The One Display Voice Rule.** 同一视口只让一个标题承担最大视觉重量，其余层级通过间距、位置和较小字号建立。

**The Chinese Reading Rule.** 中文正文首先使用 Noto Sans SC；系统字体只作加载失败回退，不作为品牌显示字体。

## Layout

桌面导航是五个固定可见的一级区域，当前区域的一个或两个真实目的地位于第二行。Today 使用约 36/64 的实践入口与材质走廊，其他空间以各自的场景资产建立入口，不复用统一大标题容器。

常规内容宽度约 1120px。页面使用 8px 附近的基础节奏，并以 14px、22px、32px 形成紧密组、普通分隔和主要分区。920–1080px 间将复杂横向构图重排，620–680px 以下进入单列；五个一级区域始终同时可见，不要求横向滚动。

**The One Focal Surface Rule.** 每个路由首屏只有一个主场景；表单、治理、历史和记录紧随其后，不能再包进第二层“总览卡”。

**The Open Plane Rule.** 记录列表优先使用分隔线、纸条、书页或时间路径；只有需要浮起、选择或保护焦点的对象才成为卡片。

## Elevation & Depth

系统以材质层叠和有方向的环境阴影表达深度。静态内容默认开放、平坦；场景站点、主动作、悬浮纸页和设置抽屉使用向右下偏移的柔和阴影。星图与照片故事可以进入更暗的专注世界，但仍由同一靛蓝、黄铜、梅色关系连接回主庭院。

### Shadow Vocabulary

- **Paper Lift** (`8px 14px 28px rgb(65 45 30 / 17%)`)：走廊纸片和小型实体站点。
- **Focal Scene** (`0 28px 72px rgb(71 50 32 / 14%)`)：空间级场景资产。
- **Indigo Action** (`6px 12px 24px rgb(48 76 112 / 20%)`)：主要动作和选中状态。
- **Drawer Edge** (`-24px 0 64px rgb(53 40 29 / 19%)`)：桌面设置抽屉。

**The Material Before Shadow Rule.** 阴影只确认已有的纸、木、石或抽屉层级，不能把空白圆角矩形伪装成内容。

## Shapes

常规控件使用 7–10px 的轻微圆角；纸片与焦点表面使用 12–14px。记录纸条可采用轻微不对称圆角，模拟手工纸张而不变成复古装饰。大场景允许直角、建筑弧面或由素材自身决定的轮廓；药丸形只用于极短状态或筛选控件。

## Components

### Buttons

- **Shape:** 主要按钮为克制的 10px 圆角，常规高度 46px。
- **Primary:** 靛蓝底、白瓷字、清晰动词；一个焦点上下文只有一个主动作。
- **Hover / Focus:** 悬停轻微上移并加深靛蓝；键盘焦点使用 2–3px 靛蓝轮廓和可见偏移。
- **Secondary / Ghost:** 暖白纸面或透明底，靛蓝文字和低对比描边；危险动作保持明确文字，不靠图标猜测。

### Cards / Containers

- **Corner Style:** 只有可选择纸片、浮层和场景站点使用 12–14px；普通记录保持开放平面。
- **Background:** 白瓷纸面叠加真实宣纸材质，或由路由专属栅格场景直接提供物理感。
- **Shadow Strategy:** 只使用 Paper Lift、Focal Scene 或语义明确的抽屉阴影。
- **Border:** 一条低对比边界即可；不要同时叠加重描边和大阴影。
- **Internal Padding:** 紧凑纸片 14–16px，功能焦点 22–32px。

### Inputs / Fields

- **Style:** 暖白半透明纸面、深墨输入、9–10px 圆角和约 12–14px 内边距。
- **Focus:** 靛蓝描边或轮廓，插入光标也使用靛蓝。
- **Error / Disabled:** 错误使用梅红语义并给出恢复动作；禁用状态必须同时降低交互性与视觉强度。

### Navigation

五个一级区域使用同一套 authored SVG 图标，桌面横向、移动端图标在上文字在下。当前一级区域由靛蓝文字和下划线标识；第二行目的地单独标识，避免用户混淆“区域”和“页面”。

### Paper Corridor

Today 的签名组件由左侧实践入口、右侧真实庭院图像和三个语义站点构成。指针移动只产生极轻的空间倾斜和晨光变化；减少动态时完全停止。移动端改为图像后的垂直站点路径，操作、状态与个人内容始终由 HTML 承载。

## Do's and Don'ts

### Do:

- **Do** 使用真实宣纸、石灰岩、浅木、白瓷与晨光图像建立新中式材质感。
- **Do** 为九个现有空间保留各自的任务结构、状态、错误恢复和显式对话交接。
- **Do** 让动作名称、加密状态、候选/确认状态在不依赖颜色的情况下可读。
- **Do** 在移动端把空间关系重排为纵向路径，同时保持五个一级区域直接可达。

### Don't:

- **Don't** 用绿色大面积铺底，也不要回到“图标 + 大标题 + 长解释 + 同尺寸卡片列表”的通用后台模板。
- **Don't** 在标题上方添加 kicker、eyebrow 或无信息价值的栏目口号。
- **Don't** 把导航、日期、控件、用户记录或模型结论烘焙进图片。
- **Don't** 用黑檀、红金奢华、满屏格栅、竹莲梅灯笼堆砌“中式”。
- **Don't** 让 3D、粒子、阴影或纹理替代语义控件、键盘操作、回退状态与减少动态模式。

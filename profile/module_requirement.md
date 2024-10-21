# 模块发布要求

## 发布方式

如果您想让您的模块发布在 `kern-crates` 组织中，且可以被组织列表识别，需要进行如下检查：

- 如果您希望让您的仓库被直接镜像到 `kern-crates` 上，请向 [管理仓库](https://github.com/kern-crates/.github) 提起 PR，修改 [sync_list](https://github.com/kern-crates/.github/blob/main/sync_list.txt) 并加入您的仓库信息，相关格式可以参考该文件内的其他仓库。
- 如果您不希望让您的仓库镜像到 `kern-crates` 上，请向 [管理仓库](https://github.com/kern-crates/.github) 提起 PR，修改 [external_repo](https://github.com/kern-crates/.github/blob/main/spider/external_repos.txt) 并加入您的仓库信息，相关格式可以参考该文件内的其他仓库。

**注意：目前默认抓取的是 Github 上的仓库，如果有 Gitee 等其他需求，请自行利用 CICD 等方式同步到 Github 上。**

## 仓库推荐配置

对于希望同步在 `kern-crates` 上的仓库，您**可以**在您的仓库的根目录中添加一个 `README.json` 文件并填充下面的内容。

```json
{
  "name": "polyhal",
  "description": "This is a crate that help you porting your kernel to multiple platforms.",
  "authors": [{
    "name": "yfblock",
    "email": "321353225@qq.com"
  }],
  "keywords": ["hal", "arch", "platform"],
  "repo": "Byte-OS/polyhal",
  "doc_url": "https://github.com/Byte-OS/polyhal/wiki"
}
```

如果您的仓库下面没有相应的 `README.json` 文件，我们会识别当前仓库下的 `Cargo.toml` 文件，并且填写相关的信息。但是由于`Cargo.toml`的信息格式较为多样，我们可能无法捕获完整的信息。

> 对仓库进行捕获并识别的代码详见[这里]([.github/spider/src/index.ts at main · kern-crates/.github](https://github.com/kern-crates/.github/blob/main/spider/src/index.ts))，欢迎指正。

### 字段说明

- `name` 字段描述了您的模块的名称;
- `description` 字段描述了您的模块介绍;
- `authors` 中使用一个 `数组` 描述了模块的作者信息;
- `keywords` 中描述了您的模块类型，您可以自由添加一些关键字。

下面是一些可选信息：

- `repo` 描述了您模块的仓库地址，比如 `Byte-OS/polyhal`，无需添加 `github` 前缀。如无次字段则指向我们抓取的仓库，这个字段在应对 `fork` 出的仓库时有比较好的支持。
- `doc_url` 描述了您模块的文档地址，填写的文档地质将在模块列表中显示。需要填入完整的 `url`。


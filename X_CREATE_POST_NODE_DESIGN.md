# X (Twitter) Create Post Node 设计方案

## 📋 概述

这是一个用于在X平台（Twitter API v2）发布帖子的workflow节点。该节点集成到nodebase的执行节点系统中，支持动态变量模板、凭证管理和实时执行状态监控。

---

## 🏗️ 整体架构

基于你项目中的节点设计模式，X Create Post节点包含以下5个关键文件：

```
src/features/execution-node/components/x-create-post/
├── schema.ts           # Zod数据验证schema
├── node.tsx            # React Flow节点UI组件
├── dialog.tsx          # 配置对话框UI
├── executor.ts         # Inngest任务执行逻辑
└── actions.ts          # 服务端操作（实时token等）
```

---

## 📊 详细设计方案

### 1️⃣ **schema.ts** - 数据模型定义

```typescript
import { Node } from "@xyflow/react";
import { z } from "zod";

export const xCreatePostDataSchema = z.object({
  // 基础配置
  credentialId: z.string().min(1, { message: "X credential is required" }),
  
  // 输出变量名（用于后续节点访问结果）
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message: "Variable name must start with a letter or underscore",
    }),

  // 核心内容
  text: z
    .string()
    .min(1, { message: "Post content is required" })
    .max(300, { message: "Post content cannot exceed 300 characters" }),

  // 可选：引用回复
  replyTo: z.object({
    enabled: z.boolean().default(false),
    tweetId: z.string().optional(),
  }).optional(),

  // 可选：媒体上传（图片/视频）
  media: z.object({
    enabled: z.boolean().default(false),
    urls: z.array(z.string().url()).optional(),
  }).optional(),

  // 可选：投票
  poll: z.object({
    enabled: z.boolean().default(false),
    options: z.array(z.string()).min(2).max(4).optional(),
    durationMinutes: z.number().min(5).max(10080).optional(),
  }).optional(),

  // 可选：引用转推
  quotePost: z.object({
    enabled: z.boolean().default(false),
    tweetUrl: z.string().url().optional(),
  }).optional(),

  // 高级选项
  advancedSettings: z.object({
    replySettings: z.enum(["everyone", "following", "mentioned"]).default("everyone"),
    includeLang: z.array(z.string()).optional(), // 限制回复语言
  }).optional(),
});

export type XCreatePostData = z.infer<typeof xCreatePostDataSchema>;
export type XCreatePostNodeType = Node<XCreatePostData>;
```

**核心字段说明：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `credentialId` | string | ✅ | X API OAuth凭证ID |
| `variableName` | string | ✅ | 输出变量名（用于模板插值） |
| `text` | string | ✅ | 帖子文本内容（支持模板变量） |
| `replyTo` | object | ❌ | 回复设置（需要tweet_id） |
| `media` | object | ❌ | 媒体附件（图片/视频URLs） |
| `poll` | object | ❌ | 投票选项配置 |
| `quotePost` | object | ❌ | 引用转推的原推文URL |
| `advancedSettings` | object | ❌ | 回复权限、语言限制等 |

---

### 2️⃣ **node.tsx** - UI组件（React Flow节点）

```typescript
import { X_CREATE_POST_CHANNEL_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchXCreatePostRealtimeToken } from "./actions";
import { XCreatePostDialog } from "./dialog";
import { XCreatePostData } from "./schema";

type XCreatePostNodeData = Partial<XCreatePostData & { [key: string]: unknown }>;
type XCreatePostNodeType = Node<XCreatePostNodeData>;

function PureXCreatePostNode(props: NodeProps<XCreatePostNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  // 执行页面时获取节点状态
  const status = useMemo(() => {
    if (props.data?.status && props.data.executionId)
      return props.data.status as NodeStatus;
  }, [props.data]);

  const handleOnSetting = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const nodeData = props.data;

  // 实时监听节点执行状态
  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: X_CREATE_POST_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchXCreatePostRealtimeToken,
  });

  // 更新节点数据
  const handleSubmit = useCallback(
    (values: XCreatePostNodeData) => {
      setNodes((nodes) => {
        return nodes.map((node) => {
          if (node.id === props.id)
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          return node;
        });
      });
    },
    [setNodes, props.id],
  );

  return (
    <>
      <XCreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/x.svg"  // 需要添加X logo到public/logos/
        id={props.id}
        name="X Create Post"
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const XCreatePostNode = memo(PureXCreatePostNode);
XCreatePostNode.displayName = "XCreatePostNode";
```

**关键特性：**
- 使用 `useNodeStatus` hook 实时监听执行状态
- 通过Inngest Realtime的channel推送更新
- Dialog形式编辑节点参数
- Memo包装优化渲染性能

---

### 3️⃣ **dialog.tsx** - 配置UI对话框

```typescript
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useCredentialByType } from "@/features/credentials/hooks/use-credentials";
import { getCredentialLogo } from "@/lib/configs/credential-constants";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { XCreatePostData, xCreatePostDataSchema } from "./schema";

interface XCreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: XCreatePostData) => void;
  defaultValues: Partial<XCreatePostData>;
}

export function XCreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: XCreatePostDialogProps) {
  const { data: credentials, isLoading: isCredentialsLoading } =
    useCredentialByType("X_API");
  const logo = getCredentialLogo("X_API");

  const form = useForm<XCreatePostData>({
    resolver: zodResolver(xCreatePostDataSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      variableName: defaultValues.variableName || "xPost",
      text: defaultValues.text || "",
      replyTo: defaultValues.replyTo || { enabled: false },
      media: defaultValues.media || { enabled: false },
      poll: defaultValues.poll || { enabled: false },
      quotePost: defaultValues.quotePost || { enabled: false },
      advancedSettings: defaultValues.advancedSettings || {
        replySettings: "everyone",
      },
    },
  });

  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName",
  }) || "xPost";

  const watchText = useWatch({
    control: form.control,
    name: "text",
  });

  const handleSubmit = useCallback(
    (data: XCreatePostData) => {
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // 重置表单
  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        variableName: defaultValues.variableName || "xPost",
        text: defaultValues.text || "",
        replyTo: defaultValues.replyTo || { enabled: false },
        media: defaultValues.media || { enabled: false },
        poll: defaultValues.poll || { enabled: false },
        quotePost: defaultValues.quotePost || { enabled: false },
        advancedSettings: defaultValues.advancedSettings || {
          replySettings: "everyone",
        },
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>X Create Post Configuration</DialogTitle>
          <DialogDescription>
            Configure how to create a post on X (Twitter)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 凭证选择 */}
            <div className="space-y-2">
              <FormLabel>X API Credential</FormLabel>
              <FormControl>
                <Select
                  value={form.watch("credentialId")}
                  onValueChange={(value) =>
                    form.setValue("credentialId", value)
                  }
                  disabled={isCredentialsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isCredentialsLoading
                          ? "Loading credentials..."
                          : "Select a credential"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials?.map((cred) => (
                      <SelectItem key={cred.id} value={cred.id}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={logo}
                            alt="X"
                            width={16}
                            height={16}
                          />
                          {cred.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {form.formState.errors.credentialId && (
                <FormMessage>
                  {form.formState.errors.credentialId.message}
                </FormMessage>
              )}
            </div>

            {/* 输出变量名 */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., xPost, createdTweet"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use in later nodes: ${`{{ ${watchVariableName}.data }}`}
                  </FormDescription>
                  {form.formState.errors.variableName && (
                    <FormMessage>
                      {form.formState.errors.variableName.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* 标签页：基础/高级 */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* 基础标签页 */}
              <TabsContent value="basic" className="space-y-6">
                {/* 帖子内容 */}
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your post content (supports template variables like {{triggerData.message}})"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchText?.length || 0}/300 characters
                      </FormDescription>
                      {form.formState.errors.text && (
                        <FormMessage>
                          {form.formState.errors.text.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                {/* 媒体附件 */}
                <FormField
                  control={form.control}
                  name="media.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Add Media (Images/Videos)</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("media.enabled") && (
                  <FormField
                    control={form.control}
                    name="media.urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media URLs</FormLabel>
                        <FormDescription>
                          Enter image or video URLs (max 4 media items)
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                            {...field}
                            value={field.value?.join("\n") || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split("\n")
                                  .filter((url) => url.trim())
                              )
                            }
                            rows={3}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* 投票 */}
                <FormField
                  control={form.control}
                  name="poll.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Add Poll</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("poll.enabled") && (
                  <>
                    <FormField
                      control={form.control}
                      name="poll.options"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poll Options (2-4)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              {...field}
                              value={field.value?.join("\n") || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .split("\n")
                                    .filter((opt) => opt.trim())
                                )
                              }
                              rows={3}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="poll.durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poll Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              max="10080"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Between 5 and 10080 minutes (7 days)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>

              {/* 高级标签页 */}
              <TabsContent value="advanced" className="space-y-6">
                {/* 回复设置 */}
                <FormField
                  control={form.control}
                  name="replyTo.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Reply to Tweet</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("replyTo.enabled") && (
                  <FormField
                    control={form.control}
                    name="replyTo.tweetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tweet ID to Reply To</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234567890"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* 引用转推 */}
                <FormField
                  control={form.control}
                  name="quotePost.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Quote Post</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("quotePost.enabled") && (
                  <FormField
                    control={form.control}
                    name="quotePost.tweetUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tweet URL to Quote</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://x.com/username/status/123..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* 回复权限 */}
                <FormField
                  control={form.control}
                  name="advancedSettings.replySettings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Can Reply</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="following">
                            Only Users I Follow
                          </SelectItem>
                          <SelectItem value="mentioned">
                            Only Mentioned Users
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* 提交按钮 */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Configuration</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

**关键UI特性：**
- 标签页设计：基础/高级设置分离
- 动态表单：根据switch切换显示/隐藏相关字段
- 实时字符计数：文本内容长度提示
- Handlebars模板支持：`{{ variableName }}`格式
- 媒体和投票可选功能

---

### 4️⃣ **executor.ts** - Inngest任务执行引擎

这是最核心的部分，处理API调用逻辑：

```typescript
import db from "@/db/instance";
import { NodeExecutor } from "@/features/executions/type";
import { xCreatePostChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { decrypt } from "@/lib/utils/encryption";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { XCreatePostData, xCreatePostDataSchema } from "./schema";

type XCreatePostNodeData = Partial<XCreatePostData>;

// Handlebars辅助函数
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  return new Handlebars.SafeString(jsonString);
});

export const xCreatePostExecutor: NodeExecutor<XCreatePostNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
  executionId,
}) => {
  const channel = xCreatePostChannel();

  // 状态更新工具函数
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-x-node-status", async () => {
      return updateNodeStatus({
        channel,
        nodeId,
        executionId,
        status,
        publish,
      });
    });
  };

  try {
    // 1. 更新状态为loading
    await changeNodeStatusUtil("loading");

    // 2. 检查节点是否可执行（验证依赖关系）
    await checkNodeCanExecute(nodeId);

    // 3. 验证和解析数据
    const safeData = xCreatePostDataSchema.safeParse(data);
    if (!safeData.success) {
      throw new NonRetriableError(
        `Invalid data for X Create Post node: ${safeData.error.issues
          .map((i) => i.message)
          .join(", ")}`
      );
    }

    // 4. 从数据库获取凭证
    const credential = await step.run("get-x-credential", () => {
      return db.query.credential.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.id, safeData.data.credentialId), eq(c.userId, userId)),
      });
    });

    if (!credential) {
      throw new NonRetriableError("No valid X API credential found");
    }

    // 5. 解密凭证（凭证存储时已加密）
    const credentialValue = decrypt(credential.value);
    // 凭证格式预期：JSON字符串 {"access_token": "...", "refresh_token": "..."}
    let accessToken: string;
    try {
      const credObj = JSON.parse(credentialValue);
      accessToken = credObj.access_token;
    } catch {
      throw new NonRetriableError("Invalid credential format");
    }

    // 6. 编译Handlebars模板（支持动态变量）
    const text = Handlebars.compile(safeData.data.text)(context);

    // 验证文本长度
    if (text.length > 300) {
      throw new NonRetriableError("Post content exceeds 300 characters");
    }

    // 7. 构建X API请求payload
    const payload: Record<string, any> = {
      text,
    };

    // 处理回复
    if (safeData.data.replyTo?.enabled && safeData.data.replyTo.tweetId) {
      payload.reply = {
        in_reply_to_tweet_id: safeData.data.replyTo.tweetId,
      };
    }

    // 处理媒体附件
    if (safeData.data.media?.enabled && safeData.data.media.urls?.length) {
      const mediaIds = await step.run("upload-x-media", async () => {
        const uploadedIds = [];
        for (const url of safeData.data.media.urls.slice(0, 4)) {
          try {
            const mediaId = await uploadMediaToX(accessToken, url);
            uploadedIds.push(mediaId);
          } catch (err) {
            console.warn(`Failed to upload media: ${url}`, err);
          }
        }
        return uploadedIds;
      });

      if (mediaIds.length > 0) {
        payload.media = {
          media_ids: mediaIds,
        };
      }
    }

    // 处理投票
    if (safeData.data.poll?.enabled && safeData.data.poll.options?.length) {
      payload.poll = {
        options: safeData.data.poll.options.slice(0, 4),
        duration_minutes: safeData.data.poll.durationMinutes || 60,
      };
    }

    // 处理引用转推
    if (safeData.data.quotePost?.enabled && safeData.data.quotePost.tweetUrl) {
      const tweetId = extractTweetIdFromUrl(
        safeData.data.quotePost.tweetUrl
      );
      if (tweetId) {
        payload.quote_tweet_id = tweetId;
      }
    }

    // 处理高级设置
    if (safeData.data.advancedSettings?.replySettings) {
      if (!payload.reply) payload.reply = {};
      payload.reply.settings = {
        allow: safeData.data.advancedSettings.replySettings,
      };
    }

    // 8. 调用X API创建帖子
    const result = await step.run("x-api-create-post", async () => {
      const response = await ky.post("https://api.x.com/2/posts", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        json: payload,
      }).json<{ data: { id: string; text: string } }>();

      return response;
    });

    // 9. 更新状态为success
    await changeNodeStatusUtil("success");

    // 10. 返回上下文（供后续节点使用）
    return {
      ...context,
      [safeData.data.variableName]: {
        data: result.data,
        success: true,
        postUrl: `https://x.com/user/status/${result.data.id}`,
      },
    };
  } catch (error) {
    // 错误处理
    if (error instanceof NonRetriableError) {
      await changeNodeStatusUtil("error");
    } else {
      await changeNodeStatusUtil("retrying");
    }
    throw error;
  }
};

/**
 * 媒体上传到X的辅助函数
 * X API需要先上传媒体，获得media_id，然后在创建帖子时引用
 */
async function uploadMediaToX(
  accessToken: string,
  mediaUrl: string
): Promise<string> {
  // 下载媒体文件
  const mediaBuffer = await ky.get(mediaUrl).arrayBuffer();

  // 上传到X的媒体端点
  const formData = new FormData();
  formData.append("media", new Blob([mediaBuffer]));

  const uploadResponse = await ky
    .post("https://upload.x.com/1.1/media/upload.json", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
    .json<{ media_id_string: string }>();

  return uploadResponse.media_id_string;
}

/**
 * 从Twitter URL中提取tweet ID
 * 支持格式：
 * - https://x.com/username/status/123456
 * - https://twitter.com/username/status/123456
 */
function extractTweetIdFromUrl(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}
```

**执行流程图：**

```
用户点击执行
  ↓
状态 → loading
  ↓
验证数据 (Zod schema)
  ↓
获取凭证 (数据库)
  ↓
解密凭证 (AES)
  ↓
编译模板 (Handlebars)
  ↓
构建Payload
  ├─ 基础文本
  ├─ 媒体上传 (可选)
  ├─ 投票选项 (可选)
  ├─ 回复/引用 (可选)
  └─ 高级设置
  ↓
调用X API v2
  ↓
返回tweet_id & URL
  ↓
状态 → success
  ↓
返回结果 (供后续节点使用)
```

---

### 5️⃣ **actions.ts** - 服务端操作

用于获取实时token和其他服务端操作：

```typescript
"use server";

import { xCreatePostChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type XCreatePostToken = Realtime.Token<
  typeof xCreatePostChannel,
  ["status"]
>;

/**
 * 获取实时状态订阅token
 * 用于前端订阅节点执行状态更新
 */
export async function fetchXCreatePostRealtimeToken(): Promise<XCreatePostToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: xCreatePostChannel(),
    topics: ["status"],
  });

  return token;
}
```

---

## 📌 数据库集成

### 更新凭证类型枚举

需要在 [src/db/schemas/credential-schema.ts](src/db/schemas/credential-schema.ts) 中添加X凭证类型：

```typescript
export const credentialType = pgEnum("credential_type", [
  "OPENAI",
  "GEMINI",
  "DEEPSEEK",
  "RESEND",
  "X_API",  // ← 新增
]);
```

### 凭证存储格式

X API凭证应存储为JSON格式（加密后）：

```json
{
  "access_token": "AAAAAAAAAAAAAAAAAAAA...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 7200
}
```

---

## 🔌 Inngest集成

### 创建Channel

在 [src/inngest/channels.ts](src/inngest/channels.ts) 中添加：

```typescript
export const X_CREATE_POST_CHANNEL_NAME = "x-create-post";

export function xCreatePostChannel() {
  return new Inngest.Channel({
    name: X_CREATE_POST_CHANNEL_NAME,
  });
}
```

### 注册执行器

在execution router中注册该节点的执行器：

```typescript
import { xCreatePostExecutor } from "@/features/execution-node/components/x-create-post/executor";

// 在executor map中
executorMap["x_create_post"] = xCreatePostExecutor;
```

---

## 🎨 UI配置

### Credential常量

在 [src/lib/configs/credential-constants.ts](src/lib/configs/credential-constants.ts) 中：

```typescript
export function getCredentialLogo(type: CredentialType) {
  const logos: Record<CredentialType, string> = {
    OPENAI: "/logos/openai.svg",
    GEMINI: "/logos/gemini.svg",
    DEEPSEEK: "/logos/deepseek.svg",
    RESEND: "/logos/resend.svg",
    X_API: "/logos/x.svg",  // ← 新增
  };
  return logos[type];
}
```

### 添加X Logo

需要在 `public/logos/x.svg` 添加X的标志（黑色X）。

---

## 🔐 OAuth 2.0 凭证流程

用户需要通过以下步骤设置X API凭证：

```
1. 访问 https://developer.x.com/
2. 创建应用 → 获取 Client ID & Secret
3. 设置OAuth 2.0 Redirect URI （回调URL）
4. 在nodebase中：
   - 凭证页 → 新建凭证
   - 选择 "X API"
   - 选择OAuth认证方式
   - 点击"Connect X Account"
   - 授权后自动保存 access_token + refresh_token
```

---

## ⚙️ 高级特性

### 1. **模板变量支持**

帖子内容支持Handlebars模板：

```
基础trigger数据：
{
  "triggerId": "google-form-trigger",
  "formResponse": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great service!"
  }
}

帖子模板：
"New form submission from {{formResponse.name}}! Message: {{formResponse.message}}"

结果：
"New form submission from John Doe! Message: Great service!"
```

### 2. **错误重试机制**

Inngest内置重试逻辑：
- `NonRetriableError` → 标记为失败，不重试
- 其他错误 → 标记为retrying，自动重试（指数退避）

### 3. **实时状态推送**

使用Inngest Realtime频道实时推送：
- `loading` → 正在调用API
- `success` → 帖子发布成功
- `error` → 发生不可恢复的错误
- `retrying` → 正在重试

---

## 📋 测试检查清单

```
□ Schema验证
  □ 必填字段验证
  □ 邮箱格式验证
  □ 变量名正则验证

□ UI功能
  □ Dialog打开/关闭
  □ 表单字段更新
  □ 标签页切换
  □ 动态显示/隐藏字段

□ 执行逻辑
  □ 凭证查询和解密
  □ Handlebars模板编译
  □ X API调用成功
  □ 媒体上传（如果选中）
  □ 投票创建（如果选中）
  □ 回复/引用（如果选中）

□ 错误处理
  □ 缺少凭证
  □ 凭证过期
  □ 无效格式
  □ API限流
  □ 网络超时

□ 实时状态
  □ loading状态显示
  □ success状态显示
  □ error状态显示
  □ Realtime token更新
```

---

## 🚀 部署步骤

1. **更新数据库schema**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

2. **添加X凭证类型到enum**
   - 更新 `credential-schema.ts`

3. **创建node组件**
   - 创建 `x-create-post/` 目录
   - 实现5个文件

4. **注册Inngest channel**
   - 在 `inngest/channels.ts` 中创建

5. **注册executor**
   - 在execution router中映射

6. **添加UI配置**
   - Logo路径
   - Credential常量

7. **测试**
   - 创建X凭证
   - 创建workflow测试节点
   - 执行并验证

---

## 📚 参考资源

- [X API v2 官方文档](https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
- [Inngest文档](https://www.inngest.com/)
- [你项目中的Resend节点参考](./resend/)
- [Handlebars模板文档](https://handlebarsjs.com/)

---

## 💡 后续优化建议

1. **媒体库集成** - 支持从workflow中使用已上传的媒体
2. **草稿保存** - 发布前保存为草稿
3. **预定发布** - 支持定时发布
4. **分析集成** - 获取推文的互动数据
5. **批量发布** - 支持根据数据集批量发布多条推文
6. **标签建议** - 基于内容的自动标签推荐
7. **媒体优化** - 自动裁剪/压缩图片到X标准尺寸


export type ModelGroupType = 'doubao' | 'openai' | 'cogview' | 'tongyi' | 'jimeng';

export interface GroupConfig {
  maxConcurrent: number;
  cooldownMs: number;
}

export interface ImageModel {
  id: string;
  name: string;
  publishDate: string; // JSON 中的日期是字符串格式
  description: string;
  category: string;
  group: ModelGroupType; // 模型组，同一组的模型共享相同的配置
  demo?: {
    prompt: string;
    images: string[];
  };
}

// 转换后的模型类型（日期已转换为 Date 对象）
export interface ImageModelWithDate extends Omit<ImageModel, 'publishDate'> {
  publishDate: Date;
}

export interface ModelsConfig {
  configs: Record<ModelGroupType, GroupConfig>;
  models: ImageModel[];
}

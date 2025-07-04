import modelsConfig from './models.json';
import { ModelsConfig, ImageModel, ImageModelWithDate, GroupConfig, ModelGroupType } from './models.types';

/**
 * 从 JSON 配置文件加载模型配置
 */
export function loadModelsConfig(): ModelsConfig {
  return modelsConfig as ModelsConfig;
}

/**
 * 将字符串日期转换为 Date 对象
 */
export function parseModelDates(models: ImageModel[]): ImageModelWithDate[] {
  return models.map(model => ({
    ...model,
    publishDate: new Date(model.publishDate),
  }));
}

/**
 * 获取所有模型（包含转换后的日期）
 */
export function getAllModels(): ImageModelWithDate[] {
  const config = loadModelsConfig();
  return parseModelDates(config.models);
}

/**
 * 获取组配置
 */
export function getGroupConfig(group: ModelGroupType): GroupConfig {
  const config = loadModelsConfig();
  return config.configs[group];
}

/**
 * 获取所有组配置
 */
export function getAllGroupConfigs(): Record<ModelGroupType, GroupConfig> {
  const config = loadModelsConfig();
  return config.configs;
}

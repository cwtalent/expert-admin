/**
 * 时间格式化工具函数
 * 将时间格式化为北京时间：yyyy-MM-dd HH:mm:ss
 */

/**
 * 格式化日期时间为北京时间格式
 * @param date 日期时间字符串或Date对象
 * @returns 格式化后的时间字符串，格式：yyyy-MM-dd HH:mm:ss
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) {
    return '-';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  // 使用toLocaleString转换为北京时间（Asia/Shanghai时区）
  // 或者直接使用本地时间（如果服务器时间已经是北京时间）
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取奖级的中文显示
 * @param awardLevel 奖级（first/second/third/1st/2nd/3rd/未选）
 * @returns 中文显示
 */
export function getAwardLevelText(awardLevel: string | null | undefined): string {
  // 处理空值
  if (!awardLevel) {
    return '未选';
  }
  
  // 去除首尾空格并转为小写
  const levelStr = String(awardLevel).trim().toLowerCase();
  
  // 如果为空字符串，返回未选
  if (levelStr === '') {
    return '未选';
  }
  
  // 完整的映射表
  const levelMap: Record<string, string> = {
    // 序数格式（数据库主要格式）
    '1st': '一等',
    '2nd': '二等',
    '3rd': '三等',
    // 英文格式
    'first': '一等',
    'second': '二等',
    'third': '三等',
    'first_prize': '一等',
    'second_prize': '二等',
    'third_prize': '三等',
    // 数字格式
    '1': '一等',
    '2': '二等',
    '3': '三等',
    // 拒绝/未选
    'reject': '未选',
    'none': '未选',
    'null': '未选',
    '': '未选',
    // 中文格式（如果已经是中文，保持不变）
    '一等': '一等',
    '二等奖': '二等',
    '三等奖': '三等',
  };
  
  // 先尝试精确匹配
  if (levelMap[levelStr]) {
    return levelMap[levelStr];
  }
  
  // 尝试匹配包含关键词的情况（更宽松的匹配）
  if (levelStr.includes('1st') || levelStr.includes('first') || levelStr.startsWith('1')) {
    return '一等';
  }
  if (levelStr.includes('2nd') || levelStr.includes('second') || levelStr.startsWith('2')) {
    return '二等';
  }
  if (levelStr.includes('3rd') || levelStr.includes('third') || levelStr.startsWith('3')) {
    return '三等';
  }
  if (levelStr.includes('reject') || levelStr.includes('none')) {
    return '未选';
  }
  
  // 如果都不匹配，返回原值（可能是中文或其他格式）
  return awardLevel;
}

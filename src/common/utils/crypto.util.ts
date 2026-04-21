// src/common/utils/crypto.util.ts
import * as crypto from 'crypto';

// 密钥必须是 16、24 或 32 位，对应 AES-128, AES-192, AES-256
// 生产环境请放在 .env 环境变量中，不要硬编码！
const AES_KEY = 'my_super_secret_key_12345678'; // 32位密钥
const IV_LENGTH = 16; // 初始化向量长度

export class CryptoUtil {
  /**
   * AES 解密
   * @param text 加密后的密文 (Base64格式)
   * @returns 解密后的明文
   */
  static decrypt(text: string): string {
    try {
      // 解析 IV 和密文 (通常 IV 会拼在密文前面，这里为了演示简单，假设 IV 是固定的或包含在密文中)
      // 严谨做法：前端将 IV 和密文拼接后传输，后端先截取前16位作为 IV
      const parts = text.split(':'); 
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(AES_KEY),
        iv,
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('密码解密失败');
    }
  }
}
// src/common/utils/crypto.util.ts
import * as crypto from 'crypto';

// ⚠️ 必须与前端完全一致
const AES_KEY = 'my_super_secret_key_1234567890AB'; // 32位
const AES_IV = 'your-iv-16-char!';                 // 16位

export class CryptoUtil {
  static decrypt(encryptedText: string): string {
    try {
      const key = Buffer.from(AES_KEY, 'utf-8');
      const iv = Buffer.from(AES_IV, 'utf-8');

      // 创建解密器
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      decipher.setAutoPadding(true);

      // 前端发送的是 Base64 格式的纯密文
      let decrypted = decipher.update(encryptedText, 'base64', 'utf-8');
      decrypted += decipher.final('utf-8');

      return decrypted;
    } catch (error) {
      console.error('Decrypt Error:', error);
      throw new Error('密码解密失败');
    }
  }
  
  // 可选：用于测试
  static encrypt(text: string): string {
      const key = Buffer.from(AES_KEY, 'utf-8');
      const iv = Buffer.from(AES_IV, 'utf-8');
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(text, 'utf-8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
  }
}
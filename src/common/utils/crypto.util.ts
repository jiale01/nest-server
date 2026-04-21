import * as crypto from 'crypto';

// ❌ 错误：这是 30 位字符
// const AES_KEY = 'my_super_secret_key_1234567890'; 

// ✅ 正确：这是 32 位字符 (在末尾加了 'AB')
const AES_KEY = 'my_super_secret_key_1234567890AB'; 

const AES_IV = 'your-iv-16-char!'; // 16位，这个没问题

export class CryptoUtil {
  static decrypt(encryptedText: string): string {
    try {
      // 确保使用 utf8 编码将字符串转为 Buffer
      const key = Buffer.from(AES_KEY, 'utf8');
      const iv = Buffer.from(AES_IV, 'utf8');

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('密码格式错误或解密失败');
    }
  }
}
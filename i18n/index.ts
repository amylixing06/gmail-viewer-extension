import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      gmail_viewer: 'Gmail 查看器',
      unread_emails: '未读邮件',
      verification_codes: '验证码',
      verification_links: '验证链接',
      refresh: '刷新',
      retry: '重试',
      expand: '展开',
      collapse: '收起',
      view_in_gmail: '在 Gmail 中查看',
      no_unread_emails: '没有未读邮件',
      no_verification_codes: '没有验证码',
      no_verification_links: '没有验证链接',
      error: {
        auth_failed: '认证失败，请重新登录',
        network_error: '网络连接失败，请检查网络设置',
        api_error: 'Gmail 服务暂时不可用，请稍后重试',
        unknown_error: '发生未知错误，请重试'
      },
      verification: {
        expiry_time: '有效期：{{time}}',
        copy_code: '复制验证码',
        code_copied: '验证码已复制',
        check_link: '检查链接安全性',
        link_safe: '链接安全',
        link_unsafe: '链接不安全'
      }
    }
  },
  en: {
    translation: {
      gmail_viewer: 'Gmail Viewer',
      unread_emails: 'Unread Emails',
      verification_codes: 'Verification Codes',
      verification_links: 'Verification Links',
      refresh: 'Refresh',
      retry: 'Retry',
      expand: 'Expand',
      collapse: 'Collapse',
      view_in_gmail: 'View in Gmail',
      no_unread_emails: 'No unread emails',
      no_verification_codes: 'No verification codes',
      no_verification_links: 'No verification links',
      error: {
        auth_failed: 'Authentication failed, please login again',
        network_error: 'Network connection failed, please check your network settings',
        api_error: 'Gmail service is temporarily unavailable, please try again later',
        unknown_error: 'An unknown error occurred, please try again'
      },
      verification: {
        expiry_time: 'Expires in: {{time}}',
        copy_code: 'Copy Code',
        code_copied: 'Code copied',
        check_link: 'Check Link Safety',
        link_safe: 'Link is safe',
        link_unsafe: 'Link is unsafe'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 
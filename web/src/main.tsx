import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { getEnv } from './config/env.ts'

const rootElement = document.getElementById('root')!

try {
  getEnv()
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : 'Không thể khởi tạo cấu hình môi trường Frontend.'
  console.error('[AquaSense Env Configuration Error]', error)

  createRoot(rootElement).render(
    <div
      role="alert"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: '20px', color: '#fca5a5' }}>
          Lỗi cấu hình môi trường Frontend
        </h1>
        <p style={{ margin: '0 0 12px', lineHeight: 1.5, color: '#e2e8f0' }}>
          {message}
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
          Kiểm tra các biến môi trường <code>VITE_*</code> trong file <code>.env</code> hoặc cấu hình build trước khi khởi động lại ứng dụng.
        </p>
      </div>
    </div>,
  )
}

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Bot, FileCode, FolderTree, Check } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const terminalLines = [
  { text: '$ grep -r "AgentInstance" src/', color: COLORS.green, delay: 0 },
  { text: '  src/store/index.ts:  AgentInstance[]', color: COLORS.textMuted, delay: 15 },
  { text: '  src/types.ts:  export interface AgentInstance', color: COLORS.textMuted, delay: 25 },
  { text: '$ cat src/components/Sidebar.tsx', color: COLORS.green, delay: 50 },
  { text: '  // ... existing sidebar code', color: COLORS.textDim, delay: 65 },
  { text: '$ mkdir -p src/components/forms', color: COLORS.green, delay: 90 },
  { text: '$ touch src/components/forms/AgentForm.tsx', color: COLORS.green, delay: 110 },
];

const codeLines = [
  'import { useState } from "react";',
  'import { CLIType, Provider } from "../types";',
  '',
  'export function AgentForm() {',
  '  const [name, setName] = useState("");',
  '  const [cli, setCli] = useState<CLIType>("claude");',
  '  const [provider, setProvider] = useState<Provider>(',
  '    "anthropic"',
  '  );',
  '',
  '  const handleSubmit = async () => {',
  '    await createAgent({ name, cli, provider });',
  '  };',
  '',
  '  return (',
  '    <form onSubmit={handleSubmit}>',
  '      <Input label="Name" value={name}',
  '        onChange={setName} />',
  '      <Select label="CLI Type"',
  '        options={CLI_OPTIONS}',
  '        value={cli} onChange={setCli} />',
  '      <Select label="Provider"',
  '        options={PROVIDER_OPTIONS}',
  '        value={provider}',
  '        onChange={setProvider} />',
  '      <Button type="submit">Create</Button>',
  '    </form>',
  '  );',
  '}',
];

const fileTree = [
  { name: 'src/', indent: 0, isDir: true },
  { name: 'components/', indent: 1, isDir: true },
  { name: 'forms/', indent: 2, isDir: true },
  { name: 'AgentForm.tsx', indent: 3, isDir: false, isNew: true },
  { name: 'Sidebar.tsx', indent: 2, isDir: false, isModified: true },
  { name: 'store/', indent: 1, isDir: true },
  { name: 'index.ts', indent: 2, isDir: false, isModified: true },
];

export const Scene4Coding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [530, 560], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Status message at top
  const statusOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Code typing speed
  const totalCodeChars = codeLines.join('\n').length;
  const codeCharsVisible = Math.floor(interpolate(frame, [180, 480], [0, totalCodeChars], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // File tree items appear
  const fileTreeProgress = interpolate(frame, [160, 250], [0, fileTree.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Summary message
  const summaryOpacity = interpolate(frame, [490, 510], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Caption
  const captionOpacity = interpolate(frame, [420, 440], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Build visible code text
  const fullCode = codeLines.join('\n');
  const visibleCode = fullCode.slice(0, codeCharsVisible);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: enterOpacity * exitOpacity }}>
      {/* Claude status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 48, backgroundColor: COLORS.bgPanel,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
        borderBottom: `1px solid ${COLORS.bgChat}`,
        opacity: statusOpacity,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: COLORS.orange,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <Bot size={16} color={COLORS.white} />
        </div>
        <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.orange, fontWeight: 600 }}>Claude</span>
        <span style={{
          fontFamily: FONTS.sans, fontSize: 10, color: COLORS.white,
          backgroundColor: COLORS.accent, borderRadius: 3, padding: '1px 5px',
        }}>BOT</span>
        <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.text }}>
          {frame < 180 ? '分析完成 — 需要修改 3 个文件' : '编写代码中...'}
        </span>
      </div>

      {/* Main split view */}
      <div style={{ display: 'flex', marginTop: 48, height: 'calc(100% - 48px)' }}>
        {/* Left: Terminal */}
        <div style={{ flex: 1, backgroundColor: COLORS.bgDark, padding: 24, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.red }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.yellow }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.green }} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, marginLeft: 8 }}>Terminal</span>
          </div>
          {terminalLines.map((line, i) => {
            const lineOpacity = interpolate(frame, [line.delay + 30, line.delay + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{
                fontFamily: FONTS.mono, fontSize: 14, color: line.color,
                opacity: lineOpacity, marginBottom: 4, lineHeight: 1.8,
              }}>
                {line.text}
              </div>
            );
          })}

          {/* File tree */}
          <div style={{ marginTop: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted,
            }}>
              <FolderTree size={14} /> Modified files:
            </div>
            {fileTree.map((item, i) => {
              if (i >= fileTreeProgress) return null;
              return (
                <div key={i} style={{
                  fontFamily: FONTS.mono, fontSize: 13,
                  color: item.isNew ? COLORS.green : item.isModified ? COLORS.orange : COLORS.textMuted,
                  paddingLeft: item.indent * 16, lineHeight: 1.8,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {item.isDir ? <FolderTree size={12} /> : <FileCode size={12} />}
                  {item.name}
                  {item.isNew && <span style={{ fontSize: 10, color: COLORS.green }}> [new]</span>}
                  {item.isModified && <span style={{ fontSize: 10, color: COLORS.orange }}> [mod]</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code editor */}
        <div style={{ flex: 1, backgroundColor: '#1a1b1e', padding: 24, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          }}>
            <FileCode size={14} color={COLORS.accent} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text }}>AgentForm.tsx</span>
          </div>
          <pre style={{
            fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text,
            lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {visibleCode}
            {codeCharsVisible < totalCodeChars && (
              <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: COLORS.accent }}>|</span>
            )}
          </pre>
        </div>
      </div>

      {/* Summary overlay */}
      <div style={{
        position: 'absolute', bottom: 100, left: 80,
        opacity: summaryOpacity,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {['创建 AgentForm.tsx', '更新 Sidebar.tsx', '更新 store/index.ts'].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: FONTS.sans, fontSize: 16, color: COLORS.green,
          }}>
            <Check size={16} /> {t}
          </div>
        ))}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        自动定位代码、编写实现、遵循项目规范
      </div>
    </AbsoluteFill>
  );
};

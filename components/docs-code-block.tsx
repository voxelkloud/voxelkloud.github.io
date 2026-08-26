export function CodeBlock({ children }: { readonly children: string }) {
  return (
    <div className="code-block">
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  )
}

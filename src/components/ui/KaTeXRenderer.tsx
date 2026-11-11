import { useState, useEffect } from 'react'

interface KaTeXRendererProps {
  content: string
  className?: string
}

export function KaTeXRenderer({ content, className = '' }: KaTeXRendererProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function renderContent() {
      try {
        // Dynamically lazy-load KaTeX and its CSS only when this component mounts
        const katex = (await import('katex')).default
        await import('katex/dist/katex.min.css')

        if (!isMounted) return

        // 1. First, process block math $$...$$
        let text = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
          try {
            return `<div class="my-2 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
            })}</div>`
          } catch {
            return `$$${math}$$`
          }
        })

        // 2. Process inline math $...$
        text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
          try {
            return katex.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
            })
          } catch {
            return `$${math}$`
          }
        })

        // 3. Process markdown images ![alt](url)
        text = text.replace(/!\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, (_, alt, url) => {
          return `<div class="my-3 flex justify-center"><img src="${url}" alt="${alt}" class="rounded-xl max-h-64 object-contain shadow-sm border border-gray-200 dark:border-neutral-800" loading="lazy" /></div>`
        })

        // 4. Process markdown links [label](url)
        text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, (_, label, url) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[var(--color-accent)] underline hover:no-underline font-semibold">${label}</a>`
        })

        // 5. Linebreaks preservation
        text = text.replace(/\n/g, '<br />')

        setRenderedHtml(text)
      } catch (err) {
        // Fallback to plain text if KaTeX fails to load
        setRenderedHtml(content)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    renderContent()

    return () => {
      isMounted = false
    }
  }, [content])

  if (loading) {
    return <span className="opacity-60 italic text-xs">Memuat rumus...</span>
  }

  return (
    <div
      className={`katex-content text-xs sm:text-sm leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}

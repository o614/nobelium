import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useConfig } from '@/lib/config'
import Head from 'next/head'
import PropTypes from 'prop-types'
import cn from 'classnames'

const Container = ({ children, layout, fullWidth, ...customMeta }) => {
  const BLOG = useConfig()

  const url = BLOG.path.length ? `${BLOG.link}/${BLOG.path}` : BLOG.link
  const meta = {
    title: BLOG.title,
    type: 'website',
    ...customMeta
  }

  // 核心防御区：提前将所有变量强行转换为安全字符串，杜绝任何 undefined 或 null 进入 Head
  const safeTitle = String(meta.title || 'Blog')
  const safeDescription = String(meta.description || '')
  const safeUrl = String(meta.slug ? `${url}/${meta.slug}` : url)
  const safeImage = String(`${BLOG.ogImageGenerateURL}/${encodeURIComponent(safeTitle)}.png?theme=dark&md=1&fontSize=125px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg`)
  const safeType = String(meta.type || 'website')
  const safeLang = String(BLOG.lang || 'en-US')
  const safeAuthor = String(BLOG.author || '')
  const safeDate = String(meta.date || '')
  
  // 安全提取深层配置，防止 BLOG.seo 本身为 undefined 导致崩溃
  const safeVerification = String((BLOG.seo && BLOG.seo.googleSiteVerification) || '')
  const safeKeywords = String((BLOG.seo && BLOG.seo.keywords) ? BLOG.seo.keywords.join(', ') : '')

  return (
    <div>
      {/* 彻底取消所有条件判断（如 ? : ），统一渲染平铺的 meta 标签 */}
      <Head>
        <title>{safeTitle}</title>
        <meta name="robots" content="follow, index" />
        <meta charSet="UTF-8" />
        <meta name="google-site-verification" content={safeVerification} />
        <meta name="keywords" content={safeKeywords} />
        <meta name="description" content={safeDescription} />
        <meta property="og:locale" content={safeLang} />
        <meta property="og:title" content={safeTitle} />
        <meta property="og:description" content={safeDescription} />
        <meta property="og:url" content={safeUrl} />
        <meta property="og:image" content={safeImage} />
        <meta property="og:type" content={safeType} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content={safeDescription} />
        <meta name="twitter:title" content={safeTitle} />
        <meta name="twitter:image" content={safeImage} />
        <meta property="article:published_time" content={safeDate} />
        <meta property="article:author" content={safeAuthor} />
      </Head>
      
      <div
        className={`wrapper ${BLOG.font === 'serif' ? 'font-serif' : 'font-sans'
          }`}
      >
        <Header
          navBarTitle={layout === 'blog' ? meta.title : null}
          fullWidth={fullWidth}
        />
        <main className={cn(
          'flex-grow transition-all',
          layout !== 'blog' && ['self-center px-4', fullWidth ? 'md:px-24' : 'w-full max-w-2xl']
        )}>
          {children}
        </main>
        <Footer fullWidth={fullWidth} />
      </div>
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.node
}

export default Container

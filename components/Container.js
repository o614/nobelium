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
  
  return (
    <div>
      <Head>
        <title>{meta.title || 'Blog'}</title>
        <meta name="robots" content="follow, index" />
        <meta charSet="UTF-8" />
        
        {/* 修复核心 1：消除 && 带来的空字符串渲染问题 */}
        {BLOG.seo.googleSiteVerification ? (
          <meta
            name="google-site-verification"
            content={BLOG.seo.googleSiteVerification}
          />
        ) : null}
        
        {BLOG.seo.keywords ? (
          <meta name="keywords" content={BLOG.seo.keywords.join(', ')} />
        ) : null}
        
        <meta name="description" content={meta.description || ''} />
        <meta property="og:locale" content={BLOG.lang || 'en-US'} />
        <meta property="og:title" content={meta.title || ''} />
        <meta property="og:description" content={meta.description || ''} />
        <meta
          property="og:url"
          content={meta.slug ? `${url}/${meta.slug}` : url}
        />
        <meta
          property="og:image"
          content={`${BLOG.ogImageGenerateURL}/${encodeURIComponent(
            meta.title || 'Blog'
          )}.png?theme=dark&md=1&fontSize=125px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg`}
        />
        <meta property="og:type" content={meta.type || 'website'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content={meta.description || ''} />
        <meta name="twitter:title" content={meta.title || ''} />
        <meta
          name="twitter:image"
          content={`${BLOG.ogImageGenerateURL}/${encodeURIComponent(
            meta.title || 'Blog'
          )}.png?theme=dark&md=1&fontSize=125px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg`}
        />
        
        {/* 修复核心 2：拆除 Fragment (<></>)，避免标签扁平化报错 */}
        {meta.type === 'article' ? (
          <meta
            property="article:published_time"
            content={meta.date || ''}
          />
        ) : null}
        {meta.type === 'article' ? (
          <meta property="article:author" content={BLOG.author || ''} />
        ) : null}
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

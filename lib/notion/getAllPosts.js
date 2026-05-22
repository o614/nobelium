import { config as BLOG } from '@/lib/server/config'

import { idToUuid } from 'notion-utils'
import dayjs from 'dayjs'
import api from '@/lib/server/notion-api'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts ({ includePages = false }) {
  const id = idToUuid(process.env.NOTION_PAGE_ID)

  const response = await api.getPage(id)

  const block = response.block
  let rawMetadata = block[id]?.value

  // 【核心修改区：向下兼容遍历寻找数据库】
  // 如果当前页面是一个普通页面 (page)，则遍历里面的所有区块，寻找真正的数据库区块
  if (rawMetadata?.type === 'page') {
    const blocks = Object.values(block)
    const dbBlock = blocks.find(
      b => b.value && (b.value.type === 'collection_view_page' || b.value.type === 'collection_view')
    )
    if (dbBlock) {
      rawMetadata = dbBlock.value // 将目标替换为找到的数据库区块
    }
  }

  // 校验类型 (使用更新后的 rawMetadata)
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database`)
    // 修复致命 Bug：原来返回 null 会导致外层调用 .map() 时崩溃，改为返回空数组 []
    return [] 
  }

  // 安全提取 collection 数据，增加 fallback 避免 response.collection 为空时崩溃
  const collection = Object.values(response.collection || {})[0]?.value
  const collectionQuery = response.collection_query
  const schema = collection?.schema

  if (!collection) {
    console.log(`未找到 collection 数据`)
    return []
  }

  // Construct Data
  const pageIds = getAllPageIds(collectionQuery)
  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const properties = (await getPageProperties(id, block, schema)) || null

    if (properties) {
      // Add fullwidth to properties
      properties.fullWidth = block[id].value?.format?.page_full_width ?? false
      // Convert date (with timezone) to unix milliseconds timestamp
      properties.date = (
        properties.date?.start_date
          ? dayjs.tz(properties.date?.start_date)
          : dayjs(block[id].value?.created_time)
      ).valueOf()

      data.push(properties)
    }
  }

  // remove all the the items doesn't meet requirements
  const posts = filterPublishedPosts({ posts: data, includePages })

  // Sort by date
  if (BLOG.sortByDate) {
    posts.sort((a, b) => b.date - a.date)
  }
  return posts
}

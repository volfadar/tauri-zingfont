// import { db } from '@/server/db'
// import { products } from '@/server/db/schema'
// import chalk from 'chalk'
// import * as cheerio from 'cheerio'
// import { eq, inArray } from 'drizzle-orm'
// import data from './font-space.json'

// const failed = [
//   198, 229, 252, 95, 100, 102, 99, 262, 111, 110, 112, 114, 64, 233, 266, 197,
//   199, 232, 97, 239, 263, 264, 116, 196, 231, 241, 253, 89, 245, 230, 265,
// ]

// function compareConv(name: string) {
//   return name
//     .toLocaleLowerCase()
//     .replace(/ /gi, '')
//     .replace(/[^A-Za-z]/gi, '')
//     .trim();
// }
// ;(async () => {
//   const status = {
//     success: 0,
//     failed: 0,
//     skipped: {
//       noFont: 0,
//       noHref: 0,
//       noTarget: 0,
//     },
//   }

//   const timeStart = performance.now()
//   const product = await db
//     .select()
//     .from(products)
//     .where(inArray(products.id, failed))
//   //   for await (const font of data.filter((font) => failed.includes(font.name))) {
//   for await (const pd of product) {
//     const font = data.find((font) =>
//       compareConv(pd.name).startsWith(compareConv(font.name)),
//     )

//     if (!font) {
//       status.skipped.noFont++
//       console.log(chalk.yellow(`  ⚠️ no font found for ${pd.name}`))
//       continue
//     }

//     const time = performance.now()
//     const $ = cheerio.load(font.dataHTML)
//     // const author = [...$('p')].map((p) => console.log({ content: $(p).html() }))
//     const target = $('h3:contains("More info from")').last().next().html()

//     // console.log({ target })

//     // if (target) {
//     //   continue
//     // }

//     if (!target) {
//       status.skipped.noTarget++
//       console.log(chalk.yellow(`  ⚠️ no target for ${font.name}`))
//       continue
//     }

//     const slug = $('a:contains("https://creatypestudio.co/")')
//       .attr('href')
//       ?.toLocaleLowerCase()
//       .split('/')
//       .filter(Boolean)
//       .pop()

//     if (!slug) {
//       status.skipped.noHref++
//       console.log(chalk.yellow(`  ⚠️ no href for ${font.name}`))
//       continue
//     }

//     let id
//     try {
//       const result = await db
//         .update(products)
//         .set({ description: target })
//         .where(eq(products.id, pd.id))
//         .returning({ id: products.id })
//       id = result[0]?.id
//     } catch (error) {
//       status.failed++
//       console.log(chalk.red(`  ❌ update DB for ${font.name} failed`))
//     }

//     if (!id) {
//       status.failed++
//       console.log(chalk.red(`  ❌ update DB for ${font.name} failed`))
//       continue
//     }

//     status.success++
//     const timeEnd = performance.now()
//     console.log(
//       chalk.green(
//         `  ✅ update DB for ${font.name} in ${id} success in ${((timeEnd - time) / 1000).toFixed(2)}s`,
//       ),
//     )
//   }

//   console.log(status)
//   const timeEnd = performance.now()
//   console.log(
//     chalk.green(
//       `  ✅ update DB for ${data.length} fonts success in ${((timeEnd - timeStart) / 1000).toFixed(2)}s`,
//     ),
//   )
// })()

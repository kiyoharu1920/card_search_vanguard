// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import iconv from "iconv-lite";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const urlParam = Array.isArray(req.query.url)
    ? req.query.url[0]
    : req.query.url;
  if (!urlParam) {
    res.status(400).json({ error: "You should add query." });
    return;
  }

  const url = new URL(urlParam);
  console.log({ req_url: url.href });

  try {
    // まずバイナリ取得
    const response = await fetch(url);
    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
      console.error(`Fetch error for ${url.href}:`, errorMessage);
      res.status(response.status).json({ 
        error: errorMessage,
        url: url.href,
        status: response.status 
      });
      return;
    }

    const buffer = await response.arrayBuffer();
    const buf = Buffer.from(buffer);

    // 一旦 UTF-8 として暫定デコード（charset 抽出用）
    const tempDecoded = iconv.decode(buf, "UTF-8");

    // charset 抽出（meta charset / http-equiv content-type の両方対応）
    let pageCharset = "UTF-8";
    const charsetMatch =
      tempDecoded.match(
        /<meta[^>]+charset\s*=\s*['"]?\s*([a-zA-Z0-9_\-]+)\s*['"]?/i
      ) ||
      tempDecoded.match(
        /<meta[^>]+http-equiv=["']content-type["'][^>]*content=["'][^"']*charset=([a-zA-Z0-9_\-]+)[^"']*["']/i
      );

    if (charsetMatch && charsetMatch[1]) {
      pageCharset = charsetMatch[1].toUpperCase();
    }

    // UTF-8 以外の場合は iconv で変換
    let decodedHtml: string;
    if (!/UTF-8/i.test(pageCharset)) {
      try {
        decodedHtml = iconv.decode(buf, pageCharset);
      } catch (e) {
        // iconv が直接対応していない場合（例：SHIFT_JIS → Windows-31J 互換）フォールバック
        if (pageCharset.includes("SHIFT_JIS") || pageCharset.includes("SJIS")) {
          decodedHtml = iconv.decode(buf, "SJIS");
        } else if (
          pageCharset.includes("CP932") ||
          pageCharset.includes("WINDOWS-31J")
        ) {
          decodedHtml = iconv.decode(buf, "CP932");
        } else {
          // 最後の手段
          decodedHtml = iconv.decode(buf, "UTF-8");
        }
      }
      // charset を UTF-8 に書き換え
      decodedHtml = decodedHtml.replace(
        /charset\s*=\s*["']?.+?["']?/gi,
        "charset=UTF-8"
      );
    } else {
      decodedHtml = tempDecoded;
    }

    //相対パスを絶対パスに変更
    decodedHtml = decodedHtml.replace(/ href="\//g, ` href="${url.origin}/`);
    decodedHtml = decodedHtml.replace(
      / action="\//g,
      ` action="${url.origin}/`
    );
    decodedHtml = decodedHtml.replace(/ src="\//g, ` src="${url.origin}/`);
    decodedHtml = decodedHtml.replace(/ url\(['"]?\//g, ` url(${url.origin}/`);

    res.status(200).send(decodedHtml);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch or convert charset" });
  }
}

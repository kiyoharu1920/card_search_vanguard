"use client";

import Image from "next/image";
import { useState } from "react";
import type { NextApiRequest, NextApiResponse } from "next";

const shops = [
  {
    name: "カードラッシュ",
    url: "https://www.cardrush-vanguard.jp/product-list?keyword=せるがおん&Submit=検索",
    searchQueryName: "keyword",
    charset: "utf-8",
  },
  {
    name: "フルアヘッド",
    url: "https://fullahead-vg.com/shop/shopbrand.html?search=レザエル",
    searchQueryName: "search",
    charset: "EUC-JP",
  },
  {
    name: "トレコロ",
    url: "https://www.torecolo.jp/shop/goods/search.aspx?keyword=レザエル&seq=&search=検索する&variation=",
    searchQueryName: "keyword",
    charset: "utf-8",
  },
  {
    name: "ドラゴンスター",
    url: "https://dorasuta.jp/vanguard/product-list?kw=レザエル",
    searchQueryName: "kw",
    charset: "utf-8",
  },
  {
    name: "遊々亭",
    url: "https://yuyu-tei.jp/sell/vg/s/search?search_word=レザエル",
    searchQueryName: "search_word",
    charset: "utf-8",
  },
  {
    name: "カードラボ",
    url: "https://www.c-labo-online.jp/product-list?keyword=レザエル&Submit=",
    searchQueryName: "keyword",
    charset: "utf-8",
  },
  {
    name: "トレマ",
    url: "https://www.tcgmp.jp/product/?prc_id=5&prg_id=9&word=レザエル",
    searchQueryName: "word",
    charset: "utf-8",
  },
  {
    name: "マスターズスクウェア通販ブシロード店",
    url: "https://www.square-bushiroad.com/product-list?keyword=レザエル&Submit=検索",
    searchQueryName: "keyword",
    charset: "utf-8",
  },
  {
    name: "楽天市場",
    url: "https://search.rakuten.co.jp/search/mall?sitem=レザエル&s=1&g=0",
    searchQueryName: "sitem",
    charset: "utf-8",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.co.jp/s?k=レザエル",
    searchQueryName: "k",
    charset: "utf-8",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const inputHandler = function (e: React.MouseEvent<HTMLInputElement>) {
    setSearch(e.currentTarget.value);
    console.log(search);
  };

  const inputEnterHandler = function (
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      const searchButtonElement = document.getElementById(`search`);
      searchButtonElement?.click();
    }
  };

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const divShops = document?.querySelector(`div#shops`);

    if (!divShops) return; // shopを入れるdivが存在しなかったら処理を終了
    divShops.innerHTML = ""; // divの中身を初期化

    shops.forEach(async (shop) => {
      const { name, url, searchQueryName, charset } = shop;
      const shopURL = new URL(url);
      console.log({ shopURL: shopURL.href });
      shopURL.searchParams.set(searchQueryName, search);
      console.log({ shopURL: shopURL.href });
      if (shopURL.href.includes("amazon")) {
        //Amazonの場合は2重引用符を使用する
        shopURL.searchParams.set(searchQueryName, `"${search}"`);
      }

      const iframeURL = `/api/search?url=${shopURL.href}`;

      const div = document.createElement(`div`);
      const anchor = `<a href="${shopURL.href}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">${name}(クリックすると新しいタブでそのショップの検索結果が開きます)</a>`;
      div.insertAdjacentHTML("beforeend", anchor);
      div.classList.add("p-5", "m-5", "bg-gray-100");

      divShops.insertAdjacentElement("beforeend", div);

      const iframe = document.createElement("iframe");
      const res = await fetch(iframeURL);
      if (res.ok) {
        iframe.srcdoc = await res.text();
        iframe.className = "w-[90vw] h-[100vh] border border-black";
      } else {
        iframe.srcdoc = `
        <p>読み込みできませんでした</p>
        <p>直接リンクに飛ぶと見れるかもしれません</p>
        <p>errer_status:${res.status}</p>`;
      }

      div.insertAdjacentElement("beforeend", iframe);
    });
  };
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <div className="w-full max-w-sm min-w-[200px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              type="text"
              name="cardName"
              onInput={inputHandler}
              onKeyDown={inputEnterHandler}
              placeholder="検索したいカード名"
            />
          </div>

          <button
            className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
            type="button"
            onClick={handleSearch}
            name="search"
            id="search"
          >
            検索
          </button>
        </div>
        <p>※表示がおかしい場合はリンク先に直接飛んでください</p>
        <div
          id="shops"
          className="flex flex-col items-center justify-center"
        ></div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

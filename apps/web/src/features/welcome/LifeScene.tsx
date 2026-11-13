/** Original decorative artwork, not a photograph or a depiction of real users. */
export default function LifeScene({
  scene = "city",
}: {
  scene?: "city" | "cafe" | "coast";
}) {
  return (
    <svg
      className={`life-scene life-${scene}`}
      viewBox="0 0 600 480"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="600"
        height="480"
        fill={scene === "cafe" ? "#e5edf0" : "#d7ecfa"}
      />
      <circle cx="465" cy="106" r="52" fill="#f4dca3" />
      <g className="life-cloud" fill="#f5fbff">
        <path d="M42 108c-5-30 37-43 53-19 25-22 59-5 54 19z" />
        <path d="M295 63c0-20 26-28 38-12 19-14 40-3 39 12z" />
      </g>
      {scene === "city" && (
        <>
          <path
            d="M0 287 85 240 164 284 268 208 357 267 447 235 600 283V480H0Z"
            fill="#a9cddd"
          />
          <g fill="#b6d6e8" stroke="#4f829c" strokeWidth="2">
            <path d="M55 314V171h83v143M158 314V128h65v186M240 314V199h83v115M349 314V155h71v159M443 314V195h95v119" />
            <path d="M174 128v-21h33v21M190 107V83M72 197h49M72 220h49M72 243h49M175 155h30M175 178h30M175 201h30M257 222h49M257 249h49M365 182h39M365 205h39M365 228h39M459 221h63M459 246h63" />
          </g>
          <path d="M0 327Q130 283 274 326T600 315V480H0Z" fill="#86b6d0" />
          <path
            d="M0 375Q138 329 308 379T600 364M0 411Q150 370 328 418T600 405"
            stroke="#c5e3ef"
            strokeWidth="3"
          />
          <g className="life-boat">
            <path d="m348 377 95 0-22 15h-52z" fill="#315f7b" />
            <path
              d="M396 376v-58l-32 48h32"
              fill="#fff7df"
              stroke="#315f7b"
              strokeWidth="2"
            />
          </g>
          <path d="M0 443Q159 404 272 443V480H0Z" fill="#477e82" />
          <path
            d="M78 447v-76m0 34-22-17m22 1 24-23"
            stroke="#315f62"
            strokeWidth="8"
          />
          <g fill="#83b7aa">
            <ellipse cx="56" cy="371" rx="27" ry="43" />
            <ellipse cx="95" cy="352" rx="29" ry="48" />
          </g>
        </>
      )}
      {scene === "cafe" && (
        <>
          <rect
            x="55"
            y="50"
            width="490"
            height="263"
            rx="120"
            fill="#bbd9e9"
          />
          <path d="M55 250h490M300 50v263" stroke="#789fae" strokeWidth="7" />
          <path
            d="M55 262 162 182l96 80 93-100 194 100v51H55Z"
            fill="#99bfbe"
          />
          <path d="M0 348h600v132H0z" fill="#b0c6cc" />
          <path d="m85 338 406 0 30 30H57z" fill="#f4e3c5" />
          <path
            d="M100 368v112m375-112v112"
            stroke="#608394"
            strokeWidth="14"
          />
          <path d="m145 277 120 0-12 64h-95z" fill="#fbf8ed" />
          <path
            d="M263 286h16c32 0 26 43-20 38"
            stroke="#fbf8ed"
            strokeWidth="10"
          />
          <ellipse cx="205" cy="277" rx="60" ry="10" fill="#9c7761" />
          <g
            className="life-steam"
            stroke="#fffdf6"
            strokeWidth="5"
            strokeLinecap="round"
          >
            <path d="M187 255c-22-20 18-28 0-48M215 249c-22-20 18-28 0-48" />
          </g>
          <path d="m314 312 102-21 42 33-104 21z" fill="#4b7998" />
          <path d="m324 316 87-17 25 20-85 18z" fill="#e1eff4" />
          <path d="M471 345v-91" stroke="#477f70" strokeWidth="6" />
          <g fill="#7faf98">
            <ellipse
              cx="450"
              cy="270"
              rx="16"
              ry="32"
              transform="rotate(-35 450 270)"
            />
            <ellipse
              cx="488"
              cy="249"
              rx="16"
              ry="32"
              transform="rotate(35 488 249)"
            />
          </g>
          <path d="m444 312 54 0-8 36h-38z" fill="#dfbe8e" />
        </>
      )}
      {scene === "coast" && (
        <>
          <path d="M0 252h600v228H0z" fill="#9bc8de" />
          <path
            d="M0 265 85 163l47 44 39-90 75 148M356 266l65-93 37 37 53-59 89 115"
            fill="#77a6ac"
          />
          <path d="M0 390Q175 287 344 364T600 333v147H0Z" fill="#eadcc1" />
          <g className="life-waves" stroke="#e7f5fa" strokeWidth="3">
            <path d="M20 300h115m70 13h108m35-29h100M15 340h90m97 7h60m185-25h130" />
          </g>
          <path d="m393 387 40-170" stroke="#658f85" strokeWidth="9" />
          <path
            d="M433 217c-71-60-122-17-133 17 55-31 78-19 133-17-26-52-4-81 21-87-11 36-13 59-21 87 71-49 113-12 123 23-44-22-79-20-123-23"
            fill="#77a999"
          />
          <path d="m170 429 13-61h72l13 61z" fill="#618da9" />
          <path d="M199 368v-17h40v17" stroke="#618da9" strokeWidth="6" />
          <path d="M193 386v26m53-26v26" stroke="#d7e7ec" strokeWidth="3" />
        </>
      )}
      <g
        className="life-birds"
        stroke="#47738a"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="m210 94 9 5 9-5m12 14 7 4 7-4" />
      </g>
    </svg>
  );
}

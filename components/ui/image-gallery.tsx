"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export type GalleryPhoto = {
  src: string
  width: number
  height: number
  alt: string
  altKo: string
  crop?: { aspectRatio: number; position?: string }
}
export type GalleryLayout = "grid" | "masonry" | "justified" | "thumbnail"

export function ImageGallery({
  photos,
  layout,
  locale = "en",
}: {
  photos: GalleryPhoto[]
  layout: GalleryLayout
  locale?: string
}) {
  const ko = locale === "ko"
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  if (!photos.length) return null
  const index = Math.min(selected, photos.length - 1)
  const active = photos[index]
  const label = (photo: GalleryPhoto) => (ko ? photo.altKo : photo.alt)
  const ratio = (photo: GalleryPhoto) =>
    photo.crop?.aspectRatio ?? photo.width / photo.height
  const image = (photo: GalleryPhoto, crop = false) => (
    <Image
      src={photo.src}
      alt={label(photo)}
      width={photo.width}
      height={photo.height}
      unoptimized
      sizes="(max-width: 640px) 45vw, 240px"
      className={
        crop || photo.crop
          ? "h-full w-full object-cover"
          : "block h-auto w-full"
      }
      style={{ objectPosition: photo.crop?.position }}
    />
  )
  const tile = (photo: GalleryPhoto, photoIndex: number, crop = false) => (
    <button
      key={photo.src}
      type="button"
      data-gallery-photo
      aria-label={label(photo)}
      style={!crop && photo.crop ? { aspectRatio: ratio(photo) } : undefined}
      className={`block w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${crop ? "aspect-[4/3]" : ""}`}
      onClick={() => {
        setSelected(photoIndex)
        setOpen(true)
      }}
    >
      {image(photo, crop)}
    </button>
  )
  const navigation = (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={ko ? "이전 이미지" : "Previous image"}
        disabled={index === 0}
        onClick={() => setSelected(index - 1)}
      >
        <ChevronLeft />
      </Button>
      <span className="text-base tabular-nums">
        {index + 1} / {photos.length}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={ko ? "다음 이미지" : "Next image"}
        disabled={index === photos.length - 1}
        onClick={() => setSelected(index + 1)}
      >
        <ChevronRight />
      </Button>
    </>
  )
  return (
    <div
      data-gallery-layout={layout}
      data-pointer-feedback="none"
      className="w-full min-w-0"
    >
      {layout === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, i) => tile(photo, i, true))}
        </div>
      )}
      {layout === "masonry" && (
        <div className="columns-2 gap-3 sm:columns-3">
          {photos.map((photo, i) => (
            <div key={photo.src} className="mb-3 break-inside-avoid">
              {tile(photo, i)}
            </div>
          ))}
        </div>
      )}
      {layout === "justified" && (
        <div className="space-y-3">
          {Array.from({ length: Math.ceil(photos.length / 3) }, (_, row) => (
            <div key={row} className="flex items-start gap-3" data-gallery-row>
              {photos.slice(row * 3, row * 3 + 3).map((photo, column) => (
                <div
                  key={photo.src}
                  className="min-w-0 basis-0"
                  style={{ flexGrow: ratio(photo) }}
                >
                  {tile(photo, row * 3 + column)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {layout === "thumbnail" && (
        <div className="space-y-4">
          <button
            type="button"
            aria-label={ko ? "이미지 크게 보기" : "Enlarge image"}
            className="block aspect-[3/2] w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => setOpen(true)}
          >
            <Image
              src={active.src}
              alt={label(active)}
              width={active.width}
              height={active.height}
              unoptimized
              sizes="(max-width: 640px) 90vw, 768px"
              className="h-full w-full object-contain"
            />
          </button>
          <div className="flex justify-center gap-3">{navigation}</div>
          <div
            className="flex gap-3 overflow-x-auto p-1"
            role="group"
            aria-label={ko ? "이미지 썸네일" : "Image thumbnails"}
          >
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                aria-label={label(photo)}
                aria-pressed={i === index}
                onClick={() => setSelected(i)}
                className={`aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-background focus-visible:outline-2 focus-visible:outline-ring ${i === index ? "ring-primary" : "ring-transparent"}`}
              >
                {image(photo, true)}
              </button>
            ))}
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{label(active)}</DialogTitle>
          <Image
            src={active.src}
            alt={label(active)}
            width={active.width}
            height={active.height}
            unoptimized
            sizes="90vw"
            className="max-h-[70svh] w-full object-contain"
          />
          <div className="flex justify-center gap-3">{navigation}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

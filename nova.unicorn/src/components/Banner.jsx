import React from 'react'

const Banner = ({src, alt, className}) => {
  return (
    <div>
        <img src={src} alt={alt} className={className} />
    </div>
  )
}

export default Banner
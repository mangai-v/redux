import { formatDistanceToNow, parseISO } from 'date-fns'
import React from 'react'

const TimeAgo = ({timestamp}) => {
    let timeAgo = ''
    const date = parseISO(timestamp)
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} ago`
  return (
    <div>{timeAgo}</div>
  )
}

export default TimeAgo
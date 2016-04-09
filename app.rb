require 'sinatra'
require 'sinatra-websocket'
require './models/users'

set :server, 'thin'
set :bind, '0.0.0.0'
$users = []
$to_close = []


get '/' do
  @debug = true
  if !request.websocket?
    erb :index
  else
    request.websocket do |ws|
      if $users.count > 100
        ws.onopen do |hs|
          $to_close << ws
        end
        ws.onmessage do |msg|
          # Doesn't matter...
        end
        ws.onclose do
          warn("Too busy!")
          $to_close.delete(ws)
        end
      else
        me = User.new(Array.new(12){[*"A".."F", *"0".."9"].sample}.join, ws)
        warn(me.trip + " connected...")
        ws.onopen do |hs|
          warn(hs.to_s)
          $users << me
        end
        ws.onmessage do |msg|
          # Stick fingers in your ears and do nothing - I give the orders around here!
        end
        ws.onclose do
          warn(me.trip + " websocket closed")
          $users.delete(me)
        end
      end
    end
  end
end

# TODO : Add an endpoint for the pi to talk to with thresholds

import { useEffect, useState } from 'react'
import { useAccount, useBalance } from 'wagmi'

import Head from 'next/head'

import {
  Container,
  Box,
  Text,
  FormControl,
  Input,
  Button,
} from '@chakra-ui/react'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import Stream from '../components/Stream'

const numeral = require('numeral')

const LIVY_TOKEN_ADDRESS = '0xd78F8d01516086676ae7Bf3dA0375C2CaC7ff550'

export default function Home() {
  const { address, isConnected } = useAccount()

  // Gets the token balance
  const [balanceObj, setBalanceObj] = useState({
    balance: '',
    available: false,
  })

  const { data, isSuccess } = useBalance({
    address,
    token: LIVY_TOKEN_ADDRESS,
  })

  useEffect(() => {
    if (isSuccess && isConnected) {
      const balance: string = numeral(
        data?.value.div('1000000000000000000'),
      ).format('0,0')
      setBalanceObj({
        balance,
        available: true,
      })
    } else {
      setBalanceObj({
        balance: '',
        available: false,
      })
    }
  }, [isSuccess, data?.value, isConnected])

  // Handling starting of stream -- starts here
  const [startLivestreamObject, setStartLivestreamObject] = useState({
    title: '',
    processing: false,
    valid: false,
  })

  useEffect(() => {
    if (isConnected && startLivestreamObject.title !== '') {
      setStartLivestreamObject({ ...startLivestreamObject, valid: true })
    } else {
      setStartLivestreamObject({ ...startLivestreamObject, valid: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, startLivestreamObject.title])

  const handleStartStream = async () => {
    setStartLivestreamObject({ ...startLivestreamObject, processing: true })
    const response = await fetch('/api/streams/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${startLivestreamObject.title}_${address}`,
      }),
    })
    const data = await response.json()
    const streamKey = data.streamKey
    setStartLivestreamObject({ ...startLivestreamObject, title: '' })
    alert(`Here is your stream key: ${streamKey}`)
  }

  const handleTitleChange = (event: any) => {
    setStartLivestreamObject({
      ...startLivestreamObject,
      title: event.target.value,
    })
  }
  // Handling starting of stream -- ends here

  // Handling getting of streams - starts here
  const [streams, setStreams] = useState([])
  const [streamsNotEmpty, setstreamsNotEmpty] = useState(false)

  useEffect(() => {
    fetch('/api/streams')
      .then((res) => res.json())
      .then((data) => {
        setStreams(data)
        const _cleanedStreams: [] = data.map((value: { name: string }) => ({
          ...value,
          name: value.name.split('_')[0],
          address: value.name.split('_')[1],
        }))
        const __cleanedStreams = _cleanedStreams.filter(
          (value: { isActive: boolean }) => {
            return value.isActive === true
          },
        )
        setStreams(__cleanedStreams)
        console.log(__cleanedStreams)
        if (__cleanedStreams.length !== 0) {
          setstreamsNotEmpty(true)
        } else {
          setstreamsNotEmpty(false)
        }
      })
  }, [])
  // Handling getting of streams - ends here

  return (
    <Container maxW="960px" bg="white">
      <Head>
        <title>Livy - Web3 Streaming</title>
      </Head>
      <Box height={100}>
        <Text fontSize="5xl" float="left" marginTop="3" marginLeft="7">
          Livy
        </Text>
        <Box padding={5} marginTop="4" float="right">
          <ConnectButton label="Sign in" showBalance={false} />
        </Box>
      </Box>
      <Box margin="6" bg="#ededed" borderRadius={10}>
        <Box padding={4}>
          {balanceObj.available ? (
            <Text
              fontSize="1xl"
              fontFamily="mono"
              marginLeft="2"
              marginBottom="3"
            >
              SLT Balance: {balanceObj.balance}
            </Text>
          ) : (
            ''
          )}
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Start a LiveStream
          </Text>
          <FormControl marginLeft="2">
            <Input
              type="text"
              placeholder="Enter Title"
              bg="white"
              onChange={handleTitleChange}
              value={startLivestreamObject.title}
            />
          </FormControl>
          {!startLivestreamObject.valid ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Start
            </Button>
          ) : startLivestreamObject.processing ? (
            <Button
              isLoading
              loadingText="Starting..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleStartStream}
            >
              Start
            </Button>
          )}
        </Box>
      </Box>
      <Text
        fontSize="2xl"
        fontFamily="mono"
        marginLeft="6"
        marginRight="6"
        marginBottom="3"
        marginTop="3"
      >
        Active Streams
      </Text>
      {streamsNotEmpty ? (
        <Box margin="6">
          {streams.map(
            (value: {
              id: string
              name: string
              playbackId: string
              address: string
            }) => (
              <Stream
                key={value.id}
                name={value.name}
                playbackId={value.playbackId}
                creatorAddress={value.address}
              />
            ),
          )}
        </Box>
      ) : (
        <Text fontSize="1xl" marginLeft="2" marginBottom="3" align="center">
          No active streams
        </Text>
      )}
    </Container>
  )
}

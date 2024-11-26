import React, { useState, useEffect } from 'react';
import './navbar.css';

interface HistoryItem {
  topic: string;
  time: string;
}

interface NavbarProps {
  handleButtonClick: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  clickHistory: (topic: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleButtonClick, inputValue, setInputValue ,clickHistory}) => {
  let [history, setHistory] = useState<HistoryItem[]>([]);
  let [update, setUpdate] = useState<number>(0);

  useEffect(() => {
    const storedHistory = localStorage.getItem('history');
    if (storedHistory) {
      let parseHistory = JSON.parse(storedHistory);
      let newHistory: HistoryItem[] = [];
      for (let i = 0; i < parseHistory.length; i++) {
        const newHistoryItem: HistoryItem = {
          topic: parseHistory[i].text,
          time: parseHistory[i].time,
        };
        newHistory.push(newHistoryItem);
      }
      setHistory(newHistory);
    }
  }, [update]);

  const handleClickDelete = (topic: string) => {
    const storedHistory = localStorage.getItem('history');
    if (storedHistory) {
      let parseHistory = JSON.parse(storedHistory);
      let newHistory: HistoryItem[] = [];
      for(let index = 0; index < parseHistory.length; index++){
        if(parseHistory[index].text == topic){
          parseHistory.splice(index, 1);
        }
      }
      for (let i = 0; i < parseHistory.length; i++) {
        const newHistoryItem: HistoryItem = {
          topic: parseHistory[i].text,
          time: parseHistory[i].time,
        };
        newHistory.push(newHistoryItem);
      }
      setHistory(newHistory);
      const stringifiedObject: string = JSON.stringify(parseHistory);
      localStorage.removeItem('history');
      localStorage.setItem('history', stringifiedObject);
    }
  }
  
  const handleClickHistory = (topic: string) => {
    clickHistory(topic);
  }

  const handleClick = () => {
    handleButtonClick();
    setUpdate(update+1);
  };

  return (
    <>
      <div id='Mywebsite' className='mt-2'>
        <div id='leftbar'>
          <h1>Mind Map</h1>
          <p>Type the topic that you want to know below&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
          <div style={{ display: 'flex' }}>
            <input
              className="form-control"
              type="text"
              id="textInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div style={{ width: '10px' }}></div>
            <button type="button" className="btn btn-primary" onClick={handleClick}>Enter</button>
          </div>
          <div className="mt-4 scrollable-slider" id="history">
            <div className="list-group">
            {history.slice().reverse().map((item, index) => (
              <a key={index} className="list-group-item list-group-item-action" onClick={() => handleClickHistory(item.topic)}>
                <div className="justify-content-between d-flex">
                  <div>
                    <h5 className="mb-1" style={{width : '200px'}}>Topic : {item.topic}</h5>
                    <small>Time : {item.time}</small>
                  </div>
                  <div>
                    <button type="button" className="btn btn-danger" onClick={() => handleClickDelete(item.topic)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;

import React, { useEffect, useState } from 'react';
import '../index.css';
import { basic_ethereum } from 'declarations/basic_ethereum';
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

const App = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState("");
  const [isAuthed, setAuthed] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [authCreated, setAuthCreated] = useState(false);
  const [myAddress, setMyAddress] = useState("");

  const renderAccountBalance = async () => {
    // showLoading();
    try {
      const data = await basic_ethereum.get_balance([account]);
      setBalance(data.toString() + ' WEI');
      console.log("Fetched balance: ", data);
    } catch (error) {
      console.error('Error rendering day detail:', error);
    }
    // hideLoading();
  };


  const identityProvider = () => {
    if (process.env.DFX_NETWORK === "local") {
      return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
    } else if (process.env.DFX_NETWORK === "ic") {
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`;
    } else {
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`;
    }
  };

  const onIdentityUpdate = async () => {
    Actor.agentOf(basic_ethereum).replaceIdentity(authClient.getIdentity());
    const isAuthenticated = await authClient.isAuthenticated();
    setAuthed(isAuthenticated);
  };

  const createAuthClient = async () => {
    const authClient = await AuthClient.create();
    setAuthClient(authClient);
    await onIdentityUpdate();
  };
  

  useEffect(() => {
    if (!authCreated) {
      createAuthClient();
      setAuthCreated(true);
    }
  }, [authCreated]);

  const login = async () => {
    await new Promise((resolve, reject) => authClient.login({
      identityProvider: identityProvider(),
      onSuccess: resolve,
      onError: reject
    }));
    await onIdentityUpdate();
    await getMyEthAddress();
  };
  
  
  const logout = async () => {
    await authClient.logout();
    await onIdentityUpdate();
  };

  const getMyEthAddress = async () => {
    const address = await basic_ethereum.ethereum_address([]);
    setMyAddress(address);
  }


  /*const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthData, setMonthData] = useState([]);
  const [dayDetail, setDayDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    renderCalendar();
  }, [currentDate]);

  useEffect(() => {
    renderDayDetail();
  }, [selectedDate]);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const renderCalendar = async () => {
    showLoading();
    await fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1);
    hideLoading();
  };

  const fetchMonthData = async (year, month) => {
    try {
      const monthData = await backend.get_month_data(year, month);
      setMonthData(monthData);
    } catch (error) {
      console.error(`Error fetching data for ${year}-${month}:`, error);
    }
  };

  const renderDayDetail = async () => {
    showLoading();
    const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    try {
      const data = await backend.get_day_data(dateString);
      setDayDetail(data?.length > 0 ? data[0] : { notes: [], on_this_day: null });
    } catch (error) {
      console.error('Error rendering day detail:', error);
    }
    hideLoading();
  };

  const handleFetchOnThisDay = async () => {
    showLoading();
    try {
      const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
      const result = await backend.fetch_and_store_on_this_day(dateString);
      console.log(result);
      renderDayDetail();
    } catch (error) {
      console.error('Error fetching On This Day data:', error);
    }
    hideLoading();
  };

  const handleDayClick = (date) => {
    setSelectedDate(new Date(date));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleCompleteNote = async (noteId) => {
    showLoading();
    const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    try {
      await backend.complete_note(dateString, noteId);
      await renderDayDetail();
      await renderCalendar();
    } catch (error) {
      console.error('Error completing note:', error);
    }
    hideLoading();
  };

  const handleNewNoteChange = (e) => setNewNoteContent(e.target.value);

  const handleAddNote = async () => {
    const content = newNoteContent.trim();
    if (content && selectedDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      showLoading();
      const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
      try {
        await backend.add_note(dateString, content);
        setNewNoteContent('');
        await renderDayDetail();
        await renderCalendar();
      } catch (error) {
        console.error('Error adding note:', error);
      }
      hideLoading();
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    return (
      <div className="calendar-grid">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="empty-day"></div>
        ))}
        {daysArray.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const isSelected = date.toDateString() === selectedDate.toDateString();

          const dayData = monthData.find((data) => new Date(data[0]).toDateString() === date.toDateString());
          const incompleteNotesCount = dayData ? dayData[1].notes.filter((note) => !note.is_completed).length : 0;

          return (
            <div
              key={day}
              className={`day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <span>{day}</span>
              {incompleteNotesCount > 0 && <span className="note-count-indicator">{incompleteNotesCount}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayDetailContent = () => {
    if (!dayDetail) return null;

    const { notes, on_this_day } = dayDetail;
    const isPastDay = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div id="day-detail">
        <h2>{selectedDate.toLocaleDateString()}</h2>
        <div className="on-this-day">
          <h3>On This Day</h3>
          {on_this_day && on_this_day.length > 0 ? (
            <div>
              <p>
                {on_this_day[0].title || 'No title'} ({on_this_day[0].year?.toString() || 'No year'})
              </p>
              <a href={on_this_day[0].wiki_link || '#'} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </div>
          ) : (
            <button id="fetch-on-this-day" onClick={handleFetchOnThisDay}>
              Get data from the Internet
            </button>
          )}
        </div>

        <div className="notes">
          <h3>Notes</h3>
          {notes.length > 0 ? (
            <ul>
              {notes.map((note, index) => (
                <li key={index} className={note.is_completed ? 'completed' : ''}>
                  {note.content}
                  {!note.is_completed && <button onClick={() => handleCompleteNote(note.id)}>Mark Complete</button>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes available for this day.</p>
          )}
        </div>

        {!isPastDay && (
          <div className="add-note">
            <input
              type="text"
              id="new-note"
              placeholder="New note"
              value={newNoteContent}
              onChange={handleNewNoteChange}
            />
            <button id="add-note" onClick={handleAddNote}>
              Add Note
            </button>
          </div>
        )}
      </div>
    );
  };*/

  return (
    <div id="root">
      <h1>Wallet</h1>
      <p>Your address: {myAddress}</p>
      <div id="calendar">
        <input 
          type="text" 
          value={account}
          onChange={(e) => setAccount(e.target.value)} 
          placeholder="Enter account"
        />
        <button onClick={renderAccountBalance}>Check balance</button> 

        {isAuthed ?
          <button onClick={logout}>Logout</button>
          : <button onClick={login}>Login</button>
        }

        <h2>
          Balance: {balance}
        </h2>
        
      </div>
      
    </div>
  );
};

export default App;

/**
 * <button id="today" onClick={handleToday}>
          Today
        </button>
        {renderCalendarDays()}



{renderDayDetailContent()}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
 */
